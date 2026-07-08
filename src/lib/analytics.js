import ReactGA from 'react-ga4';

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

export const initGA = () => {
  console.log('📊 Initializing GA4 with ID:', GA_ID);
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
    value: parseFloat(product.price),
    items: [{
      item_id: String(product.id),
      item_name: product.name,
      price: parseFloat(product.price),
      item_category: product.category,
      index: 0
    }],
  });
};

export const trackAddToCart = (product, quantity = 1) => {
  ReactGA.event('add_to_cart', {
    currency: 'USD',
    value: parseFloat(product.price) * quantity,
    items: [{
      item_id: String(product.id),
      item_name: product.name,
      price: parseFloat(product.price),
      quantity: parseInt(quantity),
      item_category: product.category
    }],
  });
};

export const trackRemoveFromCart = (product, quantity = 1) => {
  ReactGA.event('remove_from_cart', {
    currency: 'USD',
    value: parseFloat(product.price) * quantity,
    items: [{
      item_id: String(product.id),
      item_name: product.name,
      price: parseFloat(product.price),
      quantity: parseInt(quantity),
      item_category: product.category
    }]
  });
};

export const trackViewCart = (items, total) => {
  ReactGA.event('view_cart', {
    currency: 'USD',
    value: parseFloat(total),
    items: items.map((item, idx) => ({
      item_id: String(item.product_id),
      item_name: item.products?.name,
      price: parseFloat(item.products?.price),
      quantity: parseInt(item.quantity),
      item_category: item.products?.category,
      index: idx
    }))
  });
};

export const trackBeginCheckout = (items, total) => {
  ReactGA.event('begin_checkout', {
    currency: 'USD',
    value: parseFloat(total),
    items: items.map((item, idx) => ({
      item_id: String(item.id || item.product_id),
      item_name: item.name || item.products?.name,
      price: parseFloat(item.price || item.products?.price),
      quantity: parseInt(item.quantity),
      item_category: item.category || item.products?.category,
      index: idx
    })),
  });
};

export const trackPurchase = (orderId, items, total) => {
  ReactGA.event('purchase', {
    transaction_id: String(orderId),
    currency: 'USD',
    value: parseFloat(total),
    items: items.map((item, idx) => ({
      item_id: String(item.product_id || item.id),
      item_name: item.name,
      price: parseFloat(item.price),
      quantity: parseInt(item.quantity),
      item_category: item.category,
      index: idx
    })),
  });
};

export const trackViewItemList = (products, listName = 'Product Grid') => {
  ReactGA.event('view_item_list', {
    item_list_name: listName,
    items: products.map((product, idx) => ({
      item_id: String(product.id),
      item_name: product.name,
      price: parseFloat(product.price),
      item_category: product.category,
      index: idx
    }))
  });
};

export const trackSelectItem = (product, listName = 'Product Grid') => {
  ReactGA.event('select_item', {
    item_list_name: listName,
    items: [{
      item_id: String(product.id),
      item_name: product.name,
      price: parseFloat(product.price),
      item_category: product.category,
      index: 0
    }]
  });
};

export const trackSearch = (searchTerm) => {
  ReactGA.event('search', {
    search_term: searchTerm
  });
};

export const trackLogin = (method = 'email') => {
  ReactGA.event('login', { method });
};

export const trackSignUp = (method = 'email') => {
  ReactGA.event('sign_up', { method });
};
