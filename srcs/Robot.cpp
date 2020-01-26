#include "Robot.h"
#include <deque>
#include <stack>
extern bool sCheckPairs;
template <size_t N>
struct Memo
{
    size_t index; // which index filled?
    size_t value; // filled value
    std::vector<typename Game<N>::Notation> notations;
};

template <size_t N>
struct Brain
{
    Game<N> game;
    std::stack<Memo<N>> memos; // stack of the last action
    opt<Memo<N>> rewinded; // last step is rewinded?
    //std::stack<size_t> indexes; // indexes to be visited
    std::stack<size_t, std::vector<size_t>> indexes;
    size_t rewind_count = 0;
    size_t dead_end = 0;
};

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
    

    auto & indexes_stack = brain.indexes;
    indexes_stack = std::stack<size_t, std::vector<size_t>>(indexes);
    opt<Memo<N>> & rewinded = brain.rewinded;
    std::stack<Memo<N>> & memos = brain.memos;
    assert(game.isLegal());
    bool done = false;
    
    auto rewind = [&brain] () {
        if (brain.memos.empty())
        {
            // no solution!
            std::cout << " Bad Game, NO ANSWER! " << std::endl;
        }
        
        assert( !brain.memos.empty());
        auto & t = brain.memos.top();
        brain.rewinded = t;
        brain.game.unassign(t.index);
        brain.indexes.push(t.index);
        brain.game.notations().swap(t.notations);
        brain.memos.pop();
        ++brain.rewind_count;
    };
    
    auto forward = [&brain](const Memo<N> & m){
        brain.indexes.pop();
        brain.game.assign(m.index, m.value);
        brain.memos.push(m);
        brain.rewinded = std::nullopt;
    };
    
    size_t loop_count = -1;
    while (!done)
    {
        ++loop_count;
        std::cout << "count: " << loop_count << std::endl;
//        std::cout << game << std::endl;
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
                std::cout << " rewind: " << brain.rewind_count << std::endl;
                std::cout << " deadend: " << brain.dead_end << std::endl;
                break;
            } else {
                // rewind
                // Can't happen
                // no answer
                std::cout << " rewind: " << brain.rewind_count << std::endl;
                std::cout << " deadend: " << brain.dead_end << std::endl;
                std::cout << " NO ANSWER! " << std::endl;
                break;
            }
        } else {
            
            Memo<N> m;
            if (rewinded)
            {
                assert(indexes_stack.top() == rewinded.value().index);
                m = rewinded.value();
                ++ m.value;
                if (m.value > N)
                {
                    // dead end, rewind again,
                    ++brain.dead_end;
                    rewind();
                    continue;
                }
            } else {
                if (_useDynamicOrder)
                {
                    auto iii = unfilledIndexes(game);
                    std::reverse(iii.begin(), iii.end());
                    std::stack<size_t, std::vector<size_t>> ss(iii);
                    std::swap(ss, indexes_stack);
                    m.index = indexes_stack.top();
                } else {
                    m.index = indexes_stack.top();
                }
                
                if (_onlyUseValidValue)
                {
                    size_t numNum = game.notations()[m.index].nums().size();
                    if (numNum >1)
                    {
                        int lets_find_new_constratins = 1;
                    }
                    auto optNextNum = game.notations()[m.index].nextNum(std::nullopt);
                    if (!optNextNum)
                    {
                        ++brain.dead_end;
                        rewind();
                        continue;
                    }
                    assert(optNextNum);
                    m.value = optNextNum.value();
                } else {
                    m.value = 1;
                }
            }
            
            assert(m.value<=N);
            m.notations = brain.game.notations();
            forward(m);
        }
        int  bp = 1;
    }
    int bp = 1;
    return solution;
}


template opt<Game<4>> Robot::solve<4>(const Game<4> &, Robot::Callback );
template opt<Game<6>> Robot::solve<6>(const Game<6> &, Robot::Callback );
template opt<Game<9>> Robot::solve<9>(const Game<9> &, Robot::Callback );
