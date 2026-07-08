import ReactGA from 'react-ga4';

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

export const initGA = () => {
  ReactGA.initialize(GA_ID);
};

export const trackPageView = (path) => {
  ReactGA.send({ hitType: 'pageview', page: path });
};

export const trackEvent = (category, action, label = '', value = 0) => {
  ReactGA.event({ category, action, label, value });
};

export const trackViewItem = (product) => {
  ReactGA.event('view_item', {
    currency: 'USD',
    value: product.price,
    items: [{ item_id: product.id, item_name: product.name, price: product.price, item_category: product.category }],
  });
};

export const trackAddToCart = (product, quantity = 1) => {
  ReactGA.event('add_to_cart', {
    currency: 'USD',
    value: product.price * quantity,
    items: [{ item_id: product.id, item_name: product.name, price: product.price, quantity, item_category: product.category }],
  });
};

export const trackBeginCheckout = (items, total) => {
  ReactGA.event('begin_checkout', {
    currency: 'USD',
    value: total,
    items: items.map(i => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.quantity })),
  });
};

export const trackPurchase = (orderId, items, total) => {
  ReactGA.event('purchase', {
    transaction_id: orderId,
    currency: 'USD',
    value: total,
    items: items.map(i => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.quantity })),
  });
};

export const trackLogin = (method = 'email') => {
  ReactGA.event('login', { method });
};

export const trackSignUp = (method = 'email') => {
  ReactGA.event('sign_up', { method });
};
