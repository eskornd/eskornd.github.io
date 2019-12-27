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
    auto indexes = game.unfilled();
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
//                while (!memos.empty())
//                {
//                    auto & t = memos.top();
//                    if (t.value < N)
//                    {
//                        rewinded = t;
//                        game.unassign(t.index);
//                        unfilled.push_front(t.index);
//                        memos.pop();
//                        break;
//                    } else {
//                        // dead end
//                        game.unassign(t.index);
//                        unfilled.push_front(t.index);
//                        memos.pop();
//                    }
//                }
//                int bp = 2;
                
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
            
            game.checkDomain(index);
            m.index = index;
            game.assign(m.index, m.value);
            memos.push(m);
            unfilled.pop_front();
            rewinded = std::nullopt;
                
//            if (game.isLegalInsert(m.index, m.value))
//            {
//                game.assign(m.index, m.value);
//                memos.push(m);
//                unfilled.pop_front();
//                rewinded = std::nullopt;
//            } else {
//                rewinded = m;
//            }
        }
        int  bp = 1;
    }
    int bp = 1;
}


template void Robot::solve<4>(const Game<4> &, Robot::Callback );
template void Robot::solve<6>(const Game<6> &, Robot::Callback );
template void Robot::solve<9>(const Game<9> &, Robot::Callback );
