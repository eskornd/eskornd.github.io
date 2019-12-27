#include "Game.h"
#include "Robot.h"
#include <string>
#include <thread>

namespace {
    template <size_t N>
    void validateInput(std::vector<Num> & nums)
    {
        std::transform(nums.begin(), nums.end(), nums.begin(), [](auto & num){
            return (num>0 && num<=N) ? num : std::nullopt;
        });
    }
    
    template <size_t N>
    std::vector<opt<Num>> toGameInput(const std::vector<Num> & inNums)
    {
        std::vector<opt<Num>> outNums(inNums.size());
        std::transform(inNums.begin(), inNums.end(), outNums.begin(), [](auto & num){
            return (num>0 && num<=N) ? opt<Num>(num) : std::nullopt;
        });
        return outNums;
    }
    
}

int main()
{
    
    if (0)
    {
        std::vector<Num> v={ 1,2,3,4,2,3,4,1, 3,4,1,2, 4,1,2,3};
        Game<4> game(toGameInput<4>(v));
        std::cout << game << std::endl;
    }

   
    if (0)
    {
        std::vector<Num> v={ 2,1,3,4, 3,4,1,2, 4,3,2,1, 1,2,4,3};
        Game<4> game(toGameInput<4>(v));
        std::cout << game << std::endl;
    }
    
    if (0)
    {
        std::vector<Num> w={ 1,2,3,4,5,6, 2,3,4,5,6,1, 3,4,5,6,1,2, 4,5,6,1,2,3, 5,6,1,2,3,4, 6,1,2,3,4,5};
        Game<6> game6(toGameInput<6>(w));
        std::cout << game6 << std::endl;
    }
    
    if (0)
    {
        std::vector<Num> v={ 0,1,0,0, 3,0,1,2, 0,3,2,0, 1,0,4,3};
        Game<4> game(toGameInput<4>(v));
        Robot robot;
        robot.solve(game);
    }
    
    Robot::Callback waitInput = []()
    {
        std::string line;
        std::getline(std::cin, line);
    };
    
    if (0)
    {
        std::vector<Num> v={ 3,6,0,0,5,2, 1,0,0,3,0,0, 0,0,0,4,0,3, 0,3,0,5,2,0, 5,2,1,6,0,4, 0,4,0,0,1,5};
        Game<6> game(toGameInput<6>(v));
        Robot robot;
        
        robot.solve<6>(game);
    }
    
    
    Robot::Callback wait500ms = [](){
        using namespace std::chrono_literals;
        std::this_thread::sleep_for(500ms);
    };
    
    Robot::Callback wait200ms = [](){
        using namespace std::chrono_literals;
        std::this_thread::sleep_for(200ms);
    };
    
    Robot::Callback wait20ms = [](){
        using namespace std::chrono_literals;
        std::this_thread::sleep_for(20ms);
    };
    
    Robot::Callback wait10ms = [](){
        using namespace std::chrono_literals;
        std::this_thread::sleep_for(10ms);
    };
    
    Robot::Callback wait5ms = [](){
        using namespace std::chrono_literals;
        std::this_thread::sleep_for(5ms);
    };
    
    if (0)
    {
        std::vector<Num> v={ 6,0,0,4,0,0, 0,0,1,6,3,5, 5,3,0,0,4,2, 0,0,2,0,0,0, 3,6,5,0,0,0, 0,0,0,0,6,0};
        Game<6> game(toGameInput<6>(v));
        std::cout << game;
        std::cout << "press enter to start:" << std::endl;
        waitInput();
        Robot robot;
        robot.solve(game, wait200ms);
    }
    
    if (1)
    {
        std::vector<Num> v= {
            0,0,4,6,0,0,
            5,0,3,1,0,0,
            0,0,0,4,0,6,
            0,0,6,0,0,3,
            4,0,5,2,0,0,
            0,0,2,0,0,0,
        };
        
        Game<6> game(toGameInput<6>(v));

        std::cout << game;
        std::cout << "press enter to start:" << std::endl;
        waitInput();
        Robot robot;
        robot.solve(game, wait200ms);
        
        robot.solve<6>(game);
    }
    
    if (0)
    {
        std::vector<Num> v={
            7,0,0,0,0,6,5,0,0,
            0,0,0,0,9,0,2,0,0,
            0,8,4,0,0,0,7,0,0,
            0,0,3,0,0,0,9,0,4,
            0,6,0,0,0,0,0,7,0,
            9,0,0,0,1,0,0,0,0,
            0,0,7,0,4,0,0,0,3,
            0,0,0,9,0,7,0,5,0,
            0,0,9,2,5,0,0,1,0,
            };
        Game<9> game(toGameInput<9>(v));
        std::cout << game;
        std::cout << "press enter to start:" << std::endl;
        waitInput();
        Robot robot;
        robot.solve(game, wait5ms);
    }
	return 0;
}

