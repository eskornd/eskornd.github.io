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
            indexes = game.unfilled();
            break;
        case Order::eMostConstraintsFirst:
            indexes = game.unfilled(true /*sorted most constraints first*/);
            break;
        case Order::eLeastConstraintsFirst:
            indexes = game.unfilled(true /*sorted most constraints first*/);
            std::reverse(indexes.begin(), indexes.end());
            break;
        default:
            assert(false && "Should never come here");
            break;
    }
    
    std::deque<size_t> unfilled(indexes.begin(), indexes.end());
    
    std::optional<Memo> rewinded;
    std::stack<Memo> memos;
    assert(game.isLegal());
    bool done = false;
    
    size_t dead_end = 0;
    size_t rewind_count = 0;
    auto rewind = [&memos, &game, &unfilled, &rewinded, &rewind_count] () {
        assert( !memos.empty());
        auto & t = memos.top();
        rewinded = t;
        game.unassign(t.index);
        unfilled.push_front(t.index);
        memos.pop();
        ++rewind_count;
    };
    
    while (!done)
    {
        std::cout << game << std::endl;
        if (callback) callback();
        if (!game.isLegal())
        {
            rewind();
            continue;
        }
        
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
            
            size_t index = unfilled.front();
            
            Memo m;
            m.value = rewinded ? (++rewinded.value().value) : 1;
            
            if (m.value > N)
            {
                ++dead_end;
                // dead end, rewind again,
                rewind();
                continue;
            }
            
            //game.checkDomain(index);
            m.index = index;
            game.assign(m.index, m.value);
            memos.push(m);
            unfilled.pop_front();
            rewinded = std::nullopt;

        }
        int  bp = 1;
    }
    int bp = 1;
}


template void Robot::solve<4>(const Game<4> &, Robot::Callback );
template void Robot::solve<6>(const Game<6> &, Robot::Callback );
template void Robot::solve<9>(const Game<9> &, Robot::Callback );
