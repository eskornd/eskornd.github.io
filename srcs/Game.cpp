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
    bool has_no_duplicates(const std::array<opt<Num>, N> & nums)
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
Game<N>::Game(const std::vector<opt<Num>> & inNums)
: _nums()
, _notations(inNums.size())
, _groups({&_rows, &_cols, &_grids})
{
    std::copy_n(inNums.begin(), N, _nums.begin());
    initIndexLUT();
	assert(inNums.size()==N*N);
    for ( size_t i = 0; i<N; ++i)
    {
        for (size_t j = 0; j<N; ++j)
        {
            assign(i, j, inNums[i*N+j]);
        }
    }
    makeNotations();
}

template <size_t N>
Game<N>::Game(const Game<N> & inRhs)
: _nums(inRhs._nums)
, _rows(inRhs._rows)
, _cols(inRhs._cols)
, _grids(inRhs._grids)
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
void Game<N>::assign(size_t row, size_t col, const opt<Num> & num)
{
    if (num && num.value()>N)
    {
        bool cannot_happen = true;
    }
    
    _nums[ToIndex<N>(row, col)] = num;
    _rows[row][col] = num;
    _cols[col][row] = num;
    auto grid_index_pair = ToGridRowCol<N>(row, col);

    //std::cout << "[" << row << "][" << col <<"] -> " << grid_index << ", " << cell_index <<std::endl;
    _grids[grid_index_pair.first][grid_index_pair.second] = num;
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
    return std::all_of(_groups.begin(), _groups.end(), [](auto & group){
        return std::all_of(group->begin(), group->end(), [](auto & v){
            return has_no_duplicates(v);
        });
    });
}

//template <size_t N>
//bool Game<N>::isLegalInsert(size_t index, const Num & num)
//{
//    Game<N> copy = *this;
//    copy.assign(index, num);
//    return copy.isLegal();
//}

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
std::vector<size_t> Game<N>::unfilled() const
{
    std::vector<size_t> indexes;
    for (size_t i=0; i<_nums.size();++i)
    {
        if (!_nums[i])
        {
            indexes.push_back(i);
        }
    }
    return indexes;
}

template <size_t M>
std::ostream & operator<<(std::ostream & os , const Game<M> & game)
{
	os << "Dumping " << M << "x" << M<< " game" << std::endl;

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
void Game<N>::checkDomain(size_t index)
{
    std::set<Num> s;
    for (size_t i=0; i<N; ++i)
    {
        s.insert(i+1);
    }
    
    auto pair = ToRowCol<N>(index);
    auto grid_pair = ToGridRowCol<N>(pair.first, pair.second);
    
    auto & row = _rows[pair.first];
    auto & col = _cols[pair.second];
    auto & grid = _grids[grid_pair.first];
    std::vector<NumArray1D*> v = {&row, &col, &grid};
    std::for_each(v.begin(), v.end(), [&s](auto & w){
        std::for_each(w->begin(), w->end(), [&s](auto & optnum){
            if (optnum)
            {
                s.erase(*optnum);
            }
        });
    });
    return;
}

template <size_t N>
void Game<N>::makeNotations()
{
    Notation aa;
    auto s = aa.size();
    auto & nums = aa.nums();
    for ( auto & n : nums)
    {
        int bp = 1;
    }
    aa.erase(2);
    s = aa.size();
    
    
    for (size_t row = 0; row<_rows.size(); ++row)
    {
        for (size_t col =0; col < _cols.size(); ++col)
        {
            auto optNum = at(row, col);
            if (!optNum)
                continue;
            
            auto index = ToIndex<N>(row, col);
            
            // if has num assigned, clear notations
            _notations[index].clear();
            
            auto & num = *optNum;
            // remove num from row
            for (size_t i=0; i<_cols.size(); ++i)
            {
                auto j = ToIndex<N>(row, i);
                if (!has(j))
                {
                    _notations[j].erase(num);
                }
            }
            // remove num from col
            for (size_t i=0; i<_rows.size(); ++i)
            {
                size_t j = ToIndex<N>(i, col);
                if (!has(j))
                {
                    _notations[j].erase(num);
                }
            }
            
            auto & grid_index_pair = _lutIndexToGrid[index];
            for (size_t i=0; i<N; ++i)
            {
                size_t j = _lutGridToIndex[grid_index_pair.first][i];
                if (!has(j))
                {
                    _notations[j].erase(num);
                }
            }
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
}

template class Game<4>;
template class Game<6>;
template class Game<9>;
template std::ostream & operator<< <4> (std::ostream & , const Game<4> &);
template std::ostream & operator<< <6> (std::ostream & , const Game<6> &);
template std::ostream & operator<< <9> (std::ostream & , const Game<9> &);

