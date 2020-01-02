#include "Game.h"
#include <cassert>
#include <set>
#include <utility>
namespace
{
    size_t gridWidth(size_t N)
    {
        switch (N)
        {
            case 4:
                return 2;
                break;
            case 6:
                return 3;
                break;
            case 9:
                return 3;
                break;
            default:
                assert(false && "can't happen");
                break;
        }
    }
    
    size_t gridHeight(size_t N)
    {
        switch (N)
        {
            case 4:
                return 2;
                break;
            case 6:
                return 2;
                break;
            case 9:
                return 3;
                break;
            default:
                assert(false && "can't happen");
                break;
        }
    }
    
    template <size_t N>
    bool is_filled(const std::array<opt<Num>, N> & nums)
    {
        return std::all_of(nums.begin(), nums.end(), [](auto & num){
            return !!num;
        });
        
    }
    
    template <size_t N>
    bool has_no_duplicates(const std::array<opt<Num>, N> & nums, std::pair<size_t, size_t> * outIndexPair)
    {
        bool has_duplicate = false;
        for ( size_t i=0; i<nums.size(); ++i)
        {
            if ( std::nullopt==nums[i] )
                continue;
            
            for (size_t j=i+1; j<nums.size(); ++j)
            {
                if ( std::nullopt==nums[j] )
                    continue;
                
                if ( nums[i] == nums[j] )
                {
                    has_duplicate = true;
                    if (outIndexPair)
                    {
                        outIndexPair->first = i;
                        outIndexPair->second = j;
                    }
                    break;
                }
            }
            if (has_duplicate)
                break;
        }
        return !has_duplicate;
    }
    
    template <size_t N>
    std::pair<size_t, size_t> ToRowCol(size_t index)
    {
        auto row = index / N;
        auto col = index % N;
        return std::make_pair(row, col);
    }
    
    template <size_t N>
    size_t ToIndex(size_t row, size_t col)
    {
        return row * N + col;
    }
    
    template <size_t N>
    std::pair<size_t, size_t> ToGridRowCol(size_t row, size_t col)
    {
        auto w=gridWidth(N);
        auto h=gridHeight(N);
        
        auto grid_row = row/h;
        auto grid_col = col/w;
        size_t grid_index = grid_row * h + grid_col;
        auto cell_row = row % h;
        auto cell_col = col % w;
        size_t cell_index = cell_row * w + cell_col;
        return std::make_pair(grid_index, cell_index);
    }
    
    template <size_t N>
    std::pair<size_t, size_t> GridToRowCol(size_t grid_row, size_t grid_col)
    {
        auto w=gridWidth(N);
        auto h=gridHeight(N);
        
        auto col = (grid_row % h) * w + grid_col % w;
        auto row = (grid_row / h) * h + grid_col / w;
        return std::make_pair(row, col);
    }
    
    template <size_t N>
    std::pair<size_t, size_t> ToGridRowCol(size_t index)
    {
        auto pair = ToRowCol<N>(index);
        return ToGridRowCol<N>(pair.first, pair.second);
    }

}

template <size_t N>
Game<N>::Game()
: _groups({&_rows, &_cols, &_grids})
{
}

template <size_t N>
Game<N>::Game(const std::vector<opt<Num>> & inNums)
: _nums()
, _notations(inNums.size())
, _groups({&_rows, &_cols, &_grids})
{
    //std::copy_n(inNums.begin(), N, _nums.begin());
    initIndexLUT();
	assert(inNums.size()==NN);
    assert(std::all_of(_nums.begin(), _nums.end(), [](auto & optNum){ return !optNum; }));
    for ( size_t i=0; i<inNums.size(); ++i)
    {
        if (!inNums[i])
            continue;
        
        assign(i, inNums[i]);
    }
    
    initNotations();
}

template <size_t N>
Game<N>::Game(const Game<N> & inRhs)
: _nums(inRhs._nums)
, _rows(inRhs._rows)
, _cols(inRhs._cols)
, _grids(inRhs._grids)
, _notations(inRhs._notations)
, _lutIndexToGrid(inRhs._lutIndexToGrid)
, _lutGridToIndex(inRhs._lutGridToIndex)
{
    // deep copy
    _groups[0] = &_rows;
    _groups[1] = &_cols;
    _groups[2] = &_grids;
}

template <size_t N>
Game<N>& Game<N>::operator=(const Game<N> & inRhs)
{
    // deep copy
    _nums = inRhs._nums;
    _rows = inRhs._rows;
    _cols = inRhs._cols;
    _grids = inRhs._grids;
    _groups[0] = &_rows;
    _groups[1] = &_cols;
    _groups[2] = &_grids;
    
    _notations = inRhs._notations;
    _lutIndexToGrid = inRhs._lutIndexToGrid;
    _lutGridToIndex = inRhs._lutGridToIndex;
    return *this;
}

template <size_t N>
void Game<N>::initIndexLUT()
{
    for ( size_t i=0; i<NN; ++i)
    {
        auto pair = ToGridRowCol<N>(i);
        _lutGridToIndex[pair.first][pair.second] = i;
        _lutIndexToGrid[i] = pair;
    }
}

template <size_t N>
void Game<N>::unassign(size_t index)
{
    assign(index, std::nullopt);
}

template <size_t N>
void Game<N>::assign(size_t index, const opt<Num> & num)
{
    auto pair = ToRowCol<N>(index);
    assign(pair.first, pair.second, num);
}

template <size_t N>
void Game<N>::assign(size_t row, size_t col, const opt<Num> & optNum)
{
    if (optNum && optNum.value()>N)
    {
        assert( false && "Cannot happen");
    }
    
    auto index = ToIndex<N>(row, col);
    if ( optNum)
    {
        assert ( !_nums[index]);
    } else {
        assert ( _nums[index]);
    }
    Num theNum = optNum ? *optNum : *_nums[index];
    
    _nums[ToIndex<N>(row, col)] = optNum;
    _rows[row][col] = optNum;
    _cols[col][row] = optNum;
    auto grid_index_pair = ToGridRowCol<N>(row, col);

    //std::cout << "[" << row << "][" << col <<"] -> " << grid_index << ", " << cell_index <<std::endl;
    _grids[grid_index_pair.first][grid_index_pair.second] = optNum;
    if (optNum)
    {
        denoteFromRowColGrid(ToIndex<N>(row, col), theNum);
    } else {
        noteFromRowColGrid(ToIndex<N>(row, col), theNum);
    }
    
    initNotations();
}

template <size_t N>
size_t Game<N>::size() const
{
	return N;
}

template <size_t N>
const opt<Num>& Game<N>::at(size_t index) const
{
    return _nums[index];
}

template <size_t N>
bool Game<N>::has(size_t index) const
{
    return !!_nums[index];
}

template <size_t N>
const opt<Num> & Game<N>::at(size_t row, size_t col) const
{
    return at(row*N+col);
}

template <size_t N>
bool Game<N>::has(size_t row, size_t col) const
{
    return has(ToIndex<N>(row, col));
}

template <size_t N>
bool Game<N>::isLegal() const
{
    int level_one_count = -1;
    int level_two_count = -1;
    std::pair<size_t, size_t> pair;
    bool is_legal = std::all_of(_groups.begin(), _groups.end(), [&level_one_count, &level_two_count, &pair](auto & group){
        ++level_one_count;
        level_two_count = -1;
        return std::all_of(group->begin(), group->end(), [&level_two_count, &pair](auto & v){
            ++level_two_count;
            return has_no_duplicates(v, &pair);
        });
    });
    return is_legal;
}

template <size_t N>
bool Game<N>::passed() const
{
    bool all_filled = std::all_of(_groups.begin(), _groups.end(), [](auto & group)
    {
        return std::all_of(group->begin(), group->end(), [](auto & v){
            return is_filled(v);
        });
    });
    return isLegal() && all_filled;
}

template <size_t N>
std::vector<size_t> Game<N>::unfilledIndexes(bool most_constraints_first) const
{
    std::vector<size_t> indexes;
    for (size_t i=0; i<_nums.size();++i)
    {
        if (!_nums[i])
        {
            indexes.push_back(i);
        }
    }
    
    if (most_constraints_first)
    {
        auto & notations = _notations;
        std::sort(indexes.begin(), indexes.end(), [&notations](auto & a, auto & b){
            
            return notations[a].size() == notations[b].size() ? a<b : notations[a].size() < notations[b].size();
        });
    }
    return indexes;
}

template <size_t M>
std::ostream & operator<<(std::ostream & os , const Game<M> & game)
{
    size_t assigned = 0;
    for (size_t i =0; i<game.NN; ++i)
    {
        if (game.has(i))
            ++assigned;
    }
    os << "Dumping " << M << "x" << M<< " game, assigned: " << assigned << std::endl;

	for (size_t i=0; i<game.size(); ++i)
	{
		for (size_t j=0; j<game.size(); ++j)
		{
            if (game.has(i, j))
            {
                os << (int)game.at(i, j).value();
            } else {
                os << " ";
            }
            os << ", ";
		}
		os << std::endl;
	}
    
    os << "Check game: " << (game.passed() ? "OK" : "Bad") << std::endl;

	return os;
}

template <size_t N>
void Game<N>::initNotations()
{
    Notation aa;
    auto s = aa.size();
    auto & nums = aa.nums();
    
    for ( size_t i = 0; i<_notations.size(); ++i)
    {
        _notations[i].reset();
    }
    
    for (size_t row = 0; row<_rows.size(); ++row)
    {
        for (size_t col =0; col < _cols.size(); ++col)
        {
            auto optNum = at(row, col);
            if (!optNum)
                continue;
            
            auto index = ToIndex<N>(row, col);
            
            // if has num assigned, clear notations
            //_notations[index].clear();

            auto & num = *optNum;
            denoteFromRowColGrid(index, num);
        }
    }
    
    for ( auto i = 0; i<_notations.size(); ++i)
    {
        size_t size =_notations[i].size();
        if ( 0 == size)
        {
            int bp = 0;
        } else  if (1==size)
        {
            int bp = 1;
        } else  if (2==size)
        {
            int bp = 2;
        }
    }
    
    // now check for notations;
    int bp = 0;
    checkSinglePosition();
    
}

template <size_t N>
void Game<N>::denoteFromRowColGrid(size_t index, Num num)
{
    auto index_pair = ToRowCol<N>(index);
    auto & row = index_pair.first;
    auto & col = index_pair.second;

    auto & notations = _notations;
    auto erase_num_at = [this, num](size_t index){
        //if (!has(index))
            _notations[index].erase(num);
    };
    
    // denote num from row
    for (size_t i=0; i<_cols.size(); ++i)
    {
        erase_num_at(ToIndex<N>(row, i));
    }
    
    // denote num from col
    for (size_t i=0; i<_rows.size(); ++i)
    {
        erase_num_at(ToIndex<N>(i, col));
    }
    
    // denote num from grid
    auto & grid_index_pair = _lutIndexToGrid[index];
    for (size_t i=0; i<N; ++i)
    {
        erase_num_at(_lutGridToIndex[grid_index_pair.first][i]);
    }
}

template <size_t N>
void Game<N>::noteFromRowColGrid(size_t index, Num num)
{
    auto index_pair = ToRowCol<N>(index);
    auto & row = index_pair.first;
    auto & col = index_pair.second;
    
    auto & notations = _notations;
    auto insert_num_at = [this, num](size_t index){
        //if (!has(index))
            _notations[index].insert(num);
    };
    
    // denote num from row
    for (size_t i=0; i<_cols.size(); ++i)
    {
        insert_num_at(ToIndex<N>(row, i));
    }
    
    // denote num from col
    for (size_t i=0; i<_rows.size(); ++i)
    {
        insert_num_at(ToIndex<N>(i, col));
    }
    
    // denote num from grid
    auto & grid_index_pair = _lutIndexToGrid[index];
    for (size_t i=0; i<N; ++i)
    {
        insert_num_at(_lutGridToIndex[grid_index_pair.first][i]);
    }
}

template <size_t N>
void Game<N>::checkSinglePosition()
{
    // find unique notation in grid
    for (size_t i=0; i<N; ++i)
    {
        // for a grid check if n
        for (size_t n=1; n<=N; ++n)
        {
            std::vector<size_t> index_containsN;
            for (size_t j=0; j<N; ++j)
            {
                size_t index = _lutGridToIndex[i][j];
                if (!_nums[index] && _notations[index].contains(n))
                    index_containsN.push_back(index);
            }
            if (1 ==index_containsN.size())
            {
                int bb = 1;
                noteUnique(index_containsN.front(), n);
            }
        }
    }
    
    // find unique notation in row
    for (size_t i=0; i<N; ++i)
    {
        // for a row check if n
        for (size_t n=1; n<=N; ++n)
        {
            std::vector<size_t> index_containsN;
            for (size_t j=0; j<N; ++j)
            {
                size_t index = ToIndex<N>(i,j);
                if (!_nums[index] && _notations[index].contains(n))
                    index_containsN.push_back(index);
            }
            if (1 ==index_containsN.size())
            {
                int bb = 1;
                noteUnique(index_containsN.front(), n);
            }
        }
    }
    
    // find unique notation in col
    for (size_t i=0; i<N; ++i)
    {
        // for a col check if n
        for (size_t n=1; n<=N; ++n)
        {
            std::vector<size_t> index_containsN;
            for (size_t j=0; j<N; ++j)
            {
                size_t index = ToIndex<N>(j,i);
                if (!_nums[index] && _notations[index].contains(n))
                    index_containsN.push_back(index);
            }
            if (1 ==index_containsN.size())
            {
                int bb = 1;
                noteUnique(index_containsN.front(), n);
            }
        }
    }
}

template <size_t N>
void Game<N>::noteUnique(size_t index, Num num)
{
    _notations[index].clear();
    _notations[index].insert(num);
}

template <size_t N>
const std::vector<typename Game<N>::Notation> & Game<N>::notations() const
{
    return _notations;
}

template class Game<4>;
template class Game<6>;
template class Game<9>;
template std::ostream & operator<< <4> (std::ostream & , const Game<4> &);
template std::ostream & operator<< <6> (std::ostream & , const Game<6> &);
template std::ostream & operator<< <9> (std::ostream & , const Game<9> &);

