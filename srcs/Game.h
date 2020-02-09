#ifndef SUDOKU_GAME_H_INCLUDED
#define SUDOKU_GAME_H_INCLUDED

#include <cstdint>
#include <vector>
#include <array>
#include <iostream>
#include <optional>
#include <set>

template<class T> using opt = std::optional<T>;
using Num = uint8_t;

template <size_t N>
class Game
{
public:
    Game();
	Game(const std::vector<opt<Num>> & inNums);
    
    Game(const Game<N> & inRhs);
    Game& operator=(const Game<N> & inRhs);
	
	size_t size() const;
	size_t gridRowSize() const;
	size_t gridColSize() const;
	size_t cellRowSize() const;
	size_t cellColSize() const;

    const opt<Num> & at(size_t index) const;
    bool has(size_t index) const;
    
    
	const opt<Num> & at(size_t row, size_t col) const;
    bool has(size_t row, size_t col) const;
    
    bool isLegal() const;
    
    bool passed() const;

    void assign(size_t index, const opt<Num> & num);
    void assign(size_t row, size_t col, const opt<Num> & num);
    
    void unassign(size_t index);
    
    std::vector<size_t> unfilledIndices(bool most_constraints_first = false) const;
    
	template <size_t M>
	friend std::ostream & operator<< (std::ostream & os, const Game<M> & game);
	
	template <size_t M>
	friend const char * dump_complex(const Game<M> & game);
    
    class Notation
    {
    public:
        Notation()
        : _nums(defaultNums())
        {
            
        }
        
        void reset()
        {
            _nums = defaultNums();
        }
        
        const std::set<Num> & nums() const { return _nums; }
        
        void insert(Num num)
        {
            _nums.insert(num);
        }
        
        void erase(Num num)
        {
            _nums.erase(num);
        }
        
        size_t size() const
        {
            return _nums.size();
        }
        
        bool empty() const
        {
            return _nums.empty();
        }
        
        void clear()
        {
            _nums.clear();
        }
        
        bool contains(Num num) const
        {
            return _nums.end()!=_nums.find(num);
        }
        
        opt<Num> nextNum(const opt<Num> &currentNum, bool ascending = true) const
        {
            opt<Num> next;
            if (ascending)
            {
                for (auto it = _nums.begin(); it!=_nums.end(); ++it)
                {
                    if (!currentNum)
                    {
                        next = *it;
                        break;
                    }
                    if (currentNum.value()<*it)
                    {
                        next = *it;
                        break;
                    }
                }
            } else {
                for (auto it = _nums.rbegin(); it!=_nums.rend(); ++it)
                {
                    if (!currentNum)
                    {
                        next = *it;
                        break;
                    }
                    if (currentNum.value()>*it)
                    {
                        next = *it;
                        break;
                    }
                }
            }
            return next;
        }
        
    private:
        
        std::set<Num> _nums;
        static const std::set<Num>& defaultNums()
        {
            static std::set<Num> default_nums;
            static bool initialized = false;
            if (!initialized)
            {
                for ( size_t i=0; i<N; ++i)
                {
                    default_nums.insert( 1+i );
                }
                initialized = true;
            }
            return default_nums;
        }
    };
    
    const std::vector<Notation> & notations() const;
    std::vector<Notation> & notations();
    
    using NumArray1D = std::array<opt<Num>, N>;
    using NumArray2D = std::array<NumArray1D, N>;
    
    struct CheckCounter
    {
        size_t usageCountSinglePosition = 0;
        size_t usageCountSingleLine = 0;
        size_t usageCountPairs = 0;
        size_t usageCountTriplets = 0;
        size_t usageCountXWings = 0;
        size_t usageCountQuads = 0;
    };
    
    const CheckCounter& checkCounter() const
    {
        return _counter;
    }
private:
    using IndexFunc = std::function<size_t(size_t, size_t)>;
    
    static constexpr size_t NN=N*N;
	std::array<opt<Num>, NN> _nums;
    NumArray2D _rows;
    NumArray2D _cols;
    NumArray2D _grids;
    std::array<NumArray2D*, 3> _groups;
    
    std::array<std::pair<size_t, size_t>, NN> _lutIndexToGrid;
    std::array<std::array<size_t, N>,N> _lutGridToIndex;
    bool _initializing;
    void initIndexLUT();
    
    std::vector<Notation> _notations;
    void resetNotations();

    void checkNotations();
    
    
    size_t gridBasedIndex(size_t gridIndex, size_t cellIndex) const ;
    size_t rowBasedIndex(size_t rowIndex, size_t colIndex) const ;
    size_t colBasedIndex(size_t colIndex, size_t rowIndex) const ;
    
    // denote num from all notations for row/col/grid at index
    bool denoteFromRowColGrid(size_t index, Num num);
    // note num from all notations for row/col/grid at index
    void noteFromRowColGrid(size_t index, Num num);
    // note unique num at index
    void noteUnique(size_t index, Num num);
    
    // return true if changed
    bool denote(size_t index, Num num);
    
    
    // check*(): @return true if changed
    size_t checkSinglePosition();
    size_t checkSingleLine();
    size_t checkPairs();
    size_t checkTriplets();
    size_t checkXWings();
    size_t checkQuads();
    void becomeUnique(size_t index, Num num);
    
    template <typename IndexContainer>
    bool denoteRowExcept(size_t row, Num num, const IndexContainer & container);
    
    template <typename IndexContainer>
    bool denoteColExcept(size_t col, Num num, const IndexContainer & container);

    template <typename IndexContainer>
    bool denoteGridExcept(size_t grid, Num num, const IndexContainer & container);
    
    CheckCounter _counter;
};

#endif // SUDOKU_GAME_H_INCLUDED
