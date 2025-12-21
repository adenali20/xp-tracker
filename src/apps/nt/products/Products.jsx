import React, { useEffect } from 'react';
import './Products.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../../redux/reducers/productsSlice';
import { addFavorite, fetchFavorites , deleteFavorite} from '../../../redux/reducers/favoritesSlice';

export default function Products() {
    const dispatch = useDispatch();

    const { products = [], loading: productsLoading, error: productsError } = useSelector(
        (state) => state.products || {}
    );
    const { products: favorites = [], loading: favoritesLoading } = useSelector(
        (state) => state.favorites || {}
    );

    useEffect(() => {
        dispatch(fetchProducts());
        dispatch(fetchFavorites());
    }, [dispatch]);

    const handleAddToFavorites = (product) => {
        console.log(">>>>>>>",product);
        console.log("#####",favorites);

        // const isFavorite = favorites.some((fav) => fav.product.id === product.id);
        
        if (!favorites.some((fav) => fav.product.id === product.id)) {
            dispatch(addFavorite(product));
        }else{
            dispatch(deleteFavorite(product));
        }
    };

    if (productsLoading || favoritesLoading) return <div className="container">Loading...</div>;
    if (productsError) return <div className="container error">Error: {productsError}</div>;

    return (
        <div className="container">
            <h1>Products</h1>
            <div className="products-grid">
                {products.map((product) => {
                    const isFavorite = favorites.some((fav) => fav.product.id === product.id);
                    return (
                        <div key={product.id} className="product-card">
                            <h3>{product.name}</h3>
                            <p>{product.description}</p>
                            <p className="price">${product.price}</p>
                            <button
                                className={`add-favorite-btn ${isFavorite ? 'added' : ''}`}
                                onClick={() => handleAddToFavorites(product)}
                            >
                                {isFavorite ? '❤️ Added' : '🤍 Add to Favorites'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
