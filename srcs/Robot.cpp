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
    while (!done)
    {
        std::cout << game << std::endl;
        callback();
        if (!game.isLegal())
        {
            //rewind
            auto & t = memos.top();
            rewinded = t;
            game.erase(t.index);
            unfilled.push_front(t.index);
            memos.pop();
            continue;
        }
        
        if (unfilled.empty() )
        {
            // we're at leaf nodes
            if (game.isLegal())
            {
                assert(game.passed());
                done = true;
                break;
            } else {
                // rewind
                while (!memos.empty())
                {
                    auto & t = memos.top();
                    if (t.value < N)
                    {
                        rewinded = t;
                        game.erase(t.index);
                        unfilled.push_front(t.index);
                        memos.pop();
                        break;
                    } else {
                        // dead end
                        game.erase(t.index);
                        unfilled.push_front(t.index);
                        memos.pop();
                    }
                }
                int bp = 2;
                
            }
        } else {
            
            size_t index = unfilled.front();
            
            Memo m;
            m.value = rewinded ? (++rewinded.value().value) : 1;
            
            if (m.value > N)
            {
                int bp =2;
                auto & t = memos.top();
                rewinded = t;
                game.erase(t.index);
                unfilled.push_front(t.index);
                memos.pop();
                continue;
                //rewind
            }
            
            m.index = index;
            game.insert(m.index, m.value);
            memos.push(m);
            unfilled.pop_front();
            rewinded = std::nullopt;
                
//            if (game.isLegalInsert(m.index, m.value))
//            {
//                game.insert(m.index, m.value);
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
