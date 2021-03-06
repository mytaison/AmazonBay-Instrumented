const appendCartItem = (item) => {
  $('.saved-items').append(
    `<li class='saved-item-card'>
    <div class='saved-item-name-container'>
    <p class='saved-item-name'>${item.item}</p>
    </div>
    <div class='saved-item-price-container'>
    <p class='saved-item-price'>Price: <span class='price'>$${item.price}</span></p>
    </div>
    </li>`
  );
}

const appendItem = (itemObject) => {
  const { id, item_name, item_description, item_image, item_price } = itemObject;

  $('.items-list')
    .append(
      `<li
        class='item-card'
        data-id='${id}' data-item='${item_name}' data-price='${item_price}'
      >
        <div class='item-name-container'>
          <h3 class='item-name'>${item_name}</h3>
        </div>
        <div class='item-info-container'>
          <p class='item-description'>${item_description}</p>
        </div>
        <div class='item-img-container'>
          <img class='item-img' src=${item_image} alt='${item_name} image' />
        </div>
        <div class='item-price-container'>
          <p class='item-price'>Price: $${item_price}</p>
        </div>
        <button class='add-item-btn'>Add To Cart</button>
      </li>`
    );
}

const addItemToCart = (e) => {
  const item = $(e.target).closest('.item-card');
  const itemObject = $(item).data();

  const shoppingCartArray = JSON.parse(localStorage.getItem('shoppingCart')) || [];

  shoppingCartArray.push(itemObject);
  localStorage.setItem('shoppingCart', JSON.stringify(shoppingCartArray));

  $('.saved-items').children().remove();
  fetchFromStorage();
}

const appendOrder = (orderObject) => {
  const { id, order_total, created_at } = orderObject;
  const dateOrdered = created_at.slice(0, 10);

  $('.recent-orders-list')
    .append(
      `<li class='order-card'>
        <div class='order-id-container'>
          <h3 class='order-id'>Order Id: #${id}</h3>
        </div>
        <div class='order-date-container'>
          <p class='order-date'>Date Ordered: ${dateOrdered}</p>
        </div>
        <div class='order-total-container'>
          <p class='order_total'>Total: $${order_total}</p>
        </div>
      </li>`
    );
}

const calculateTotal = (itemsArray) => {
  let totalCost = 0;
  itemsArray.forEach(item => {
    totalCost += item.price;
  });

  $('.cart-total').text(`Total: $${totalCost}`);
}

const clearCart = () => {
  localStorage.removeItem('shoppingCart');
  $('.cart-total').text('');
  $('.saved-items').children().remove();
}

const fetchAll = (path, appendMethod) => {
  fetch(`/api/v1/${path}`)
    .then( response => {
      if (response.status !== 200) {
        console.log(response);
      }
      return response;
    })
    .then( response => response.json() )
    .then( parsedResponse => {
      return parsedResponse.map( object => appendMethod(object) )
    })
    .catch( error => console.log(error) );
}

const fetchFromStorage = () => {
  const itemsInStorage = JSON.parse(localStorage.getItem('shoppingCart'));

  if(!itemsInStorage) {
    $('.saved-items').append(
      `<li class='empty-cart-card'>
          <h3 class='empty-msg'>Your cart is empty. Try adding some items!</h3>
      </li>`
    );
  } else {
    calculateTotal(itemsInStorage);
    itemsInStorage.forEach( item => appendCartItem(item));
  }
}

const loadPage = () => {
  fetchAll('inventory', appendItem);
  fetchAll('order_history', appendOrder);
  fetchFromStorage();
}

const purchaseItems = () => {
  let totalCost = 0;
  const shoppingCart = JSON.parse(localStorage.getItem('shoppingCart'));

  shoppingCart.forEach(item => {
    totalCost += item.price;
  });

  sendOrderToDB(totalCost);
  clearCart();
}

const sendOrderToDB = (orderTotal) => {
  fetch('/api/v1/order_history', {
    method: 'POST',
    body: JSON.stringify({ order_total: orderTotal }),
    headers: { 'Content-Type': 'application/json' }
  })
  .then(response => response.json())
  .then(parsedResponse => appendOrder(parsedResponse[0]))
  .catch(error => console.log({ error }));
}

const slideLeft = () => {
  $('.shopping-cart-container').toggleClass('open-cart');
}

const slideRight = () => {
  $('.order-history-container').toggleClass('open-orders');
}

$('.nav-cart').on('click', slideLeft);
$('.nav-orders').on('click', slideRight);
$('.clear-cart-btn').on('click', clearCart);
$('.purchase-btn').on('click', purchaseItems);
$('.items-list').on('click', '.add-item-btn', addItemToCart);
$(window).on('load', loadPage);
