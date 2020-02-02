#include "Robot.h"
#include <deque>
#include <stack>
extern bool sCheckPairs;

template <size_t N>
std::vector<size_t> Robot::unfilledIndexes(const Game<N> & game) const
{
    std::vector<size_t> indexes;
    switch (_order)
    {
        case Order::eNatural:
            indexes = game.unfilledIndexes();
            break;
        case Order::eMostConstraintsFirst:
            indexes = game.unfilledIndexes(true /*sorted most constraints first*/);
            break;
        case Order::eLeastConstraintsFirst:
            indexes = game.unfilledIndexes(true /*sorted most constraints first*/);
            std::reverse(indexes.begin(), indexes.end());
            break;
        default:
            assert(false && "Should never come here");
            break;
    }
    return indexes;
}

template <size_t N>
opt<Game<N>> Robot::solve(const Game<N> & inGame, Robot::Callback callback)
{
    opt<Game<N>> solution;
    Brain<N> brain;
    brain.game = inGame;
    Game<N> & game = brain.game;
    std::vector<size_t> possible_nums(N);
    for ( size_t i=0; i<N; ++i)
    {
        possible_nums[i] = 1+i;
    }
    
    std::vector<size_t> indexes = unfilledIndexes(game);
    std::reverse(indexes.begin(), indexes.end());

    
    brain.unfilledIndices = std::stack<size_t, std::vector<size_t>>(indexes);
    auto & indexes_stack = brain.unfilledIndices;
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
        
        if (indexes_stack.empty() )
        {
            // we're at leaf nodes
            if (game.isLegal())
            {
                assert(game.passed());
                solution = brain.game;
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

    std::cout << " rewind: " << brain.rewind_count << std::endl;
    std::cout << " deadend: " << brain.dead_end << std::endl;
    std::cout << "Has solution? " << (solution? "YES!" : "NO!") << std::endl;
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
    brain.game.unassign(t.index);
    brain.unfilledIndices.push(t.index);
    brain.game.notations().swap(t.notations);
    brain.memos.pop();
    ++brain.rewind_count;
}

template <size_t N>
void Robot::forward(Brain<N> & brain, const Memo<N> & m)
{
    brain.unfilledIndices.pop();
    brain.game.assign(m.index, m.value);
    brain.memos.push(m);
    brain.rewinded = std::nullopt;
}


template <size_t N>
opt<Robot::Memo<N>> Robot::findNextStep(Brain<N> & brain)
{
    Game<N> & game = brain.game;
    auto & indexes_stack = brain.unfilledIndices;
    opt<Memo<N>> & rewinded = brain.rewinded;
    std::stack<Memo<N>> & memos = brain.memos;
    
    Memo<N> m;
    if (rewinded)
    {
        assert(indexes_stack.top() == rewinded.value().index);
        m = rewinded.value();
        
        bool isSingleChoice = false;
        auto optNextNum = nextNum(brain, m.index, m.value, &isSingleChoice);
        if (optNextNum)
        {
            m.value = optNextNum.value();
        } else {
            ++brain.dead_end;
            return std::nullopt;
        }
    } else {
        m.index = nextIndex(brain);
        bool isSingleChoice = false;
        auto optNextNum = nextNum(brain, m.index, std::nullopt /* no current value*/, &isSingleChoice);
        if (!optNextNum)
        {
            ++brain.dead_end;
            return std::nullopt;
        }
        m.value = optNextNum.value();
        m.isSingleChoice = isSingleChoice;
    }
    return m;
}

template <size_t N>
size_t Robot::nextIndex(Brain<N> & brain)
{
    const auto & game = brain.game;
    size_t nextIndex = 0;
    
    auto & indexes_stack = brain.unfilledIndices;
    if (_useDynamicOrder)
    {
        auto unfilled = unfilledIndexes(game);
        std::reverse(unfilled.begin(), unfilled.end());
        
        std::stack<size_t, std::vector<size_t>> ss(unfilled);
        std::swap(ss, indexes_stack);
        nextIndex = indexes_stack.top();
    } else {
        nextIndex = indexes_stack.top();
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
        optNextNum = notation.nextNum(currentValue);
    } else {
        optNextNum = 1;
    }
    
    return optNextNum;
}

template opt<Game<4>> Robot::solve<4>(const Game<4> &, Robot::Callback );
template opt<Game<6>> Robot::solve<6>(const Game<6> &, Robot::Callback );
template opt<Game<9>> Robot::solve<9>(const Game<9> &, Robot::Callback );
