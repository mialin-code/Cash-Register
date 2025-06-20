let cid = [
    ['PENNY', 0.5],
    ['NICKEL', 0.25],
    ['DIME', 0.3],
    ['QUARTER', 1.25],
    ['ONE', 5],
    ['FIVE', 10],
    ['TEN', 20],
    ['TWENTY', 40],
    ['ONE HUNDRED', 100]
  ];
  
  const currencyUnit = {
    "PENNY": 0.01,
    "NICKEL": 0.05,
    "DIME": 0.1,
    "QUARTER": 0.25,
    "ONE": 1,
    "FIVE": 5,
    "TEN": 10,
    "TWENTY": 20,
    "ONE HUNDRED": 100
  };
  
  const cashInput = document.getElementById("cash");
  const change = document.getElementById("change-due");
  const button = document.getElementById("purchase-btn");
  const cartItemsUl = document.getElementById("cart-items");
  const totalPriceSpan = document.getElementById("total-price");
  
  const bell = new Audio('https://www.soundjay.com/button/beep-07.wav');
  
  let cart = [];
  
  const addButtons = document.querySelectorAll(".add-btn");
  addButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const li = btn.parentElement;
      const itemName = li.querySelector(".item-name").textContent;
      const itemPriceText = li.querySelector(".item-price").textContent;
      const itemPrice = parseFloat(itemPriceText.replace('$', ''));
  
      addItemToCart(itemName, itemPrice);
    });
  });
  
  function addItemToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({ name, price, quantity: 1 });
    }
    updateCartDisplay();
  }
  
  function removeItemFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    updateCartDisplay();
  }
  
  function updateCartDisplay() {
    cartItemsUl.innerHTML = '';
  
    if (cart.length === 0) {
      cartItemsUl.innerHTML = '<li class="empty-cart">No items</li>';
      totalPriceSpan.textContent = '0.00';
      return;
    }
  
    cart.forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`;
  
      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'X';
      removeBtn.classList.add('cart-remove-btn');
      removeBtn.addEventListener('click', () => removeItemFromCart(item.name));
      li.appendChild(removeBtn);
  
      cartItemsUl.appendChild(li);
    });
  
    totalPriceSpan.textContent = cartTotal().toFixed(2);
  }
  
  function cartTotal() {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }
  
  button.addEventListener('click', () => {
    const price = parseFloat(cartTotal().toFixed(2));
    if (price === 0) {
      alert("You have to order something first.");
      return;
    }
  
    const cashGiven = parseFloat(cashInput.value);
    if (isNaN(cashGiven)) {
      alert("Please enter a valid cash amount.");
      return;
    }
  
    if (cashGiven < price) {
      alert("Not enough cash. Try again!");
      return;
    }
  
    if (cashGiven === price) {
      change.textContent = "Exact change!";
      bell.play();
      clearOrder();
      return;
    }
  
    let changeDue = parseFloat((cashGiven - price).toFixed(2));
    let cidSum = parseFloat(cid.reduce((acc, el) => acc + el[1], 0).toFixed(2));
  
    if (cidSum < changeDue) {
      change.textContent = "Sorry, we can’t make change for that amount. Try a smaller bill.";
      return;
    }
  
    if (cidSum === changeDue) {
      let closedArr = cid
        .filter(([name, amount]) => amount > 0)
        .sort((a, b) => currencyUnit[b[0]] - currencyUnit[a[0]]);
      const closedString = closedArr.map(([name, amount]) => `${name}: $${amount.toFixed(2)}`).join(", ");
      change.textContent = `Order complete! We gave back exact change.\nBreakdown: ${closedString}`;
      bell.play();
      clearOrder();
      return;
    }
  
    let sortedCid = [...cid].reverse();
    let changeArr = [];
  
    for (let [name, amount] of sortedCid) {
      let value = currencyUnit[name];
      let amountToGive = 0;
  
      while (changeDue >= value && amount > 0) {
        changeDue = parseFloat((changeDue - value).toFixed(2));
        amount -= value;
        amountToGive += value;
      }
  
      if (amountToGive > 0) {
        changeArr.push([name, amountToGive]);
      }
    }
  
    if (changeDue > 0) {
      change.textContent = "We couldn’t make the right change. Try exact or smaller bills.";
      return;
    }
  
    const changeString = changeArr.map(([name, amount]) => `${name}: $${amount.toFixed(2)}`).join(", ");
    change.textContent = `Order complete! Your change is $${(cashGiven - price).toFixed(2)}.\nBreakdown: ${changeString}`;
    bell.play();
    clearOrder();
  });
  
  function clearOrder() {
    cart = [];
    updateCartDisplay();
    cashInput.value = '';
  }
  