#include "Robot.h"
#include <deque>
#include <stack>

struct Memo
{
    size_t value; // filled value
    size_t index; // which index filled?
};

template <size_t N>
void Robot::solve(const Game<N> & inGame, Robot::Callback callback)
{
    Game<N> game = inGame;
    std::vector<size_t> possible_nums(N);
    for ( size_t i=0; i<N; ++i)
    {
        possible_nums[i] = 1+i;
    }
    
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
    
    std::deque<size_t> unfilled_indexes(indexes.begin(), indexes.end());
    std::reverse(indexes.begin(), indexes.end());
    std::stack<size_t, std::vector<size_t>> indexes_stack(indexes);
    
    
    std::optional<Memo> rewinded;
    std::stack<Memo> memos;
    assert(game.isLegal());
    bool done = false;
    
    size_t dead_end = 0;
    size_t rewind_count = 0;
    auto rewind = [&memos, &game, &unfilled_indexes, &rewinded, &rewind_count, &indexes_stack] () {
        assert( !memos.empty());
        auto & t = memos.top();
        rewinded = t;
        game.unassign(t.index);
        unfilled_indexes.push_front(t.index);
        indexes_stack.push(t.index);
        memos.pop();
        ++rewind_count;
    };
    auto & unfilled = unfilled_indexes;
    size_t loop_count = -1;
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
        
        
//        bool always_update_index = false;
//        if (always_update_index)
//        {
//            auto iii = game.unfilled(true);
//            unfilled = std::deque<size_t>(iii.begin(), iii.end());
//        }
        //std::deque<size_t> & unfilled = unfilled_indexes;
        
        
        if (unfilled.empty() )
        {
            // we're at leaf nodes
            if (game.isLegal())
            {
                assert(game.passed());
                done = true;
                std::cout << " rewind: " << rewind_count << std::endl;
                std::cout << " deadend: " << dead_end << std::endl;
                break;
            } else {
                // rewind
                // Can't happen
                // no answer
                std::cout << " rewind: " << rewind_count << std::endl;
                std::cout << " deadend: " << dead_end << std::endl;
                std::cout << " NO ANSWER! " << std::endl;
                break;
            }
        } else {
            
            Memo m;
            if (rewinded)
            {
                m.value = ++rewinded.value().value;
            } else {
                m.value = 1;
            }
            
            if (m.value > N)
            {
                ++dead_end;
                // dead end, rewind again,
                rewind();
                continue;
            }
            
            if (rewinded)
            {
                assert(unfilled.front() == rewinded.value().index);
                assert(indexes_stack.top() == rewinded.value().index);
                m.index = rewinded.value().index;
            } else {
                assert(indexes_stack.top() == unfilled.front());
                m.index = indexes_stack.top();
                
            }
            
            unfilled.pop_front();
            indexes_stack.pop();
            
            game.assign(m.index, m.value);
            memos.push(m);
            rewinded = std::nullopt;
        }
        int  bp = 1;
    }
    int bp = 1;
}


template void Robot::solve<4>(const Game<4> &, Robot::Callback );
template void Robot::solve<6>(const Game<6> &, Robot::Callback );
template void Robot::solve<9>(const Game<9> &, Robot::Callback );
