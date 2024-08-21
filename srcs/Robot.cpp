#include "Robot.h"
#include <deque>
#include <stack>
#include <cassert>

void Robot::setIndexOrder(IndexOrder order)
{
    _indexOrder = order;
}

void Robot::setNumOrder(NumOrder order)
{
    _numOrder = order;
}

template <size_t N>
std::vector<size_t> Robot::unfilledIndices(const Game<N> & game) const
{
    std::vector<size_t> indexes;
    switch (_indexOrder)
    {
        case IndexOrder::eNatural:
            indexes = game.unfilledIndices();
            break;
        case IndexOrder::eMostConstraintsFirst:
            indexes = game.unfilledIndices(true /*sorted most constraints first*/);
            break;
        case IndexOrder::eLeastConstraintsFirst:
            indexes = game.unfilledIndices(true /*sorted most constraints first*/);
            std::reverse(indexes.begin(), indexes.end());
            break;
        default:
            assert(false && "Should never come here");
            break;
    }
    return indexes;
}

template <size_t N>
Solution<N> Robot::solve(const Game<N> & inGame, Robot::Callback callback)
{
    Solution<N> solution;
    Brain<N> brain;
    brain.game = inGame;
    Game<N> & game = brain.game;
    std::vector<size_t> possible_nums(N);
    for ( size_t i=0; i<N; ++i)
    {
        possible_nums[i] = 1+i;
    }
    
    std::vector<size_t> indexes = unfilledIndices(game);
    std::reverse(indexes.begin(), indexes.end());

    
    brain.unfilledIndices = std::stack<size_t, std::vector<size_t>>(indexes);
    auto & unfilled_indices = brain.unfilledIndices;
    opt<Memo<N>> & rewinded = brain.rewinded;
    std::stack<Memo<N>> & memos = brain.memos;
    assert(game.isLegal());
    bool done = false;

    auto rewind = [this, &brain] () { this->rewind(brain); };
    auto forward = [this, &brain](const Memo<N> & m){ this->forward(brain, m); };
    
    size_t & loop_count = _loopCount;
    loop_count = -1;
    while (!done)
    {
        ++loop_count;
        std::cout << "count: " << loop_count << std::endl;
        std::cout << game << std::endl;
        if (callback) callback();
        
        if (!game.isLegal())
        {
            rewind();
            continue;
        }
        
        if (unfilled_indices.empty() )
        {
            // we're at leaf nodes
            if (game.isLegal())
            {
                assert(game.passed());
                solution.endGame = brain.game;
                done = true;
                break;
            } else {
                assert(false && "Should never come here" );
                break;
            }
        } else {
            
            auto optMemo = findNextStep(brain);
            if (!optMemo)
            {
                rewind();
                continue;
            }
            Memo<N> & m = optMemo.value();
            assert(m.value<=N);
            m.notations = brain.game.notations();
            
            forward(m);
        }
    }
    solution.deadEnd = brain.dead_end;
    solution.numGuess = brain.num_guess;
    return solution;
}


template <size_t N>
void Robot::rewind(Brain<N> & brain)
{
    if (brain.memos.empty())
    {
        // no solution!
        std::cout << " Bad Game, NO ANSWER! " << std::endl;
    }
    
    assert( !brain.memos.empty());
    auto & t = brain.memos.top();
    
    brain.rewinded = t;
    brain.game.notations().swap(t.notations);
    brain.game.unassign(t.index);
    brain.unfilledIndices.push(t.index);
    brain.memos.pop();
    ++brain.rewind_count;
}

template <size_t N>
void Robot::forward(Brain<N> & brain, const Memo<N> & m)
{
    brain.unfilledIndices.pop();
    brain.game.assign(m.index, m.value);
    brain.memos.push(m);
    if (!m.isSingleChoice)
        ++brain.num_guess;
    
    std::cout << "Assign [" << m.index << "] " << (int)m.value << std::endl;
    brain.rewinded = std::nullopt;
}


template <size_t N>
opt<Robot::Memo<N>> Robot::findNextStep(Brain<N> & brain)
{
    Game<N> & game = brain.game;
    auto & unfilled_indices = brain.unfilledIndices;
    opt<Memo<N>> & rewinded = brain.rewinded;
    std::stack<Memo<N>> & memos = brain.memos;
    
    assert( (!rewinded) ||
           (unfilled_indices.top() == rewinded.value().index && "For rewinded index stack top matches the next index"));
    size_t next_index = rewinded ? rewinded.value().index : nextIndex(brain);
    opt<Num> current_value = rewinded ? (opt<Num>)rewinded.value().value : std::nullopt;
    
    bool isSingleChoice = false;
    auto optNextNum = nextNum(brain, next_index, current_value, &isSingleChoice);
    if (!optNextNum)
    {
        ++brain.dead_end; // We ran out of choices
        return std::nullopt;
    }
    
    Memo<N> m;
    m.index = next_index;
    m.value = optNextNum.value();
    m.isSingleChoice = isSingleChoice;

    return m;
}

template <size_t N>
size_t Robot::nextIndex(Brain<N> & brain)
{
    const auto & game = brain.game;
    size_t nextIndex = 0;
    
    auto & unfilled_indices = brain.unfilledIndices;
    if (_useDynamicOrder)
    {
        auto unfilled = unfilledIndices(game);
        std::reverse(unfilled.begin(), unfilled.end());
        
        std::stack<size_t, std::vector<size_t>> ss(unfilled);
        std::swap(ss, unfilled_indices);
        nextIndex = unfilled_indices.top();
    } else {
        nextIndex = unfilled_indices.top();
    }
    return nextIndex;
}

template <size_t N>
opt<Num> Robot::nextNum(const Brain<N> & brain, size_t index, opt<Num> currentValue, bool * outIsSingleChoice)
{
    const auto & game = brain.game;
    auto & notation = game.notations()[index];
    
    opt<Num> optNextNum = std::nullopt;
    if (_onlyUseValidValue)
    {
        if (outIsSingleChoice)
        {
            *outIsSingleChoice = 1==notation.nums().size();
        }
        bool ascending = (NumOrder::eAscending == _numOrder);
        optNextNum = notation.nextNum(currentValue, ascending);
    } else {
        optNextNum = 1;
    }
    
    return optNextNum;
}

template Solution<4> Robot::solve<4>(const Game<4> &, Robot::Callback );
template Solution<6> Robot::solve<6>(const Game<6> &, Robot::Callback );
template Solution<9> Robot::solve<9>(const Game<9> &, Robot::Callback );
