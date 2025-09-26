module.exports = {
    renderhomePage: (req, res) => {
        res.render('home', { title: 'Home Page' });
    },

    renderfav: (req, res) => {
        res.render('favorites', { title: 'Favorite Page' });
    },

    rendercart: (req, res) => {
        res.render('cart', { title: 'Cart Page' });
    },

    renderall_review: (req, res) => {
        res.render('all_review', { title: 'All Review Page' });
    },

    rendercategory: (req, res) => {
        res.render('category', { title: 'Category Page' });
    },

    renderDetail_Pro: (req, res) => {
        res.render('Detail_Pro', { title: 'Detail' });
    },

    rendermy_rentals: (req, res) => {
        res.render('my_rentals', { title: 'My Rentals Page' });
    }
}