// budget ctrl
var budgetController = (function() {

  var Expense = function(id,description,value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };
  
  var Income = function(id,description,value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };
  
  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(cur) {
      sum += + cur.value;
    });
    
    data.totals[type] = sum;
    
  };

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };
  
  return {
    addItem: function(type, des, val) {
      var newItem, ID;
      
      // ID = last ID + 1
      
      // create new ID
      if(data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }
      
      
      // create new item based on inc or exp type
      if (type === 'exp') {
        newItem = new Expense(ID, des, val);
      } else if (type === 'inc') {
        newItem = new Income(ID, des, val);
      }
      
      // push it into our data structure
      data.allItems[type].push(newItem);
      
      // return the new element
      return newItem;
    },
    
    calculateBudget: function() {
      
      // calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');
      
      
      
      // calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;
      
      
      // calculate the percentage of the income that we spent
      
      if(data.totals.inc > 0) {
        
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
        
      } else {
        data.percentage = -1;
      }
      
    },
    
    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },
    
    testing: function() {
      console.log(data);
    }
    
  };
  
})();



// ui ctrl
var UIController = (function() {
  
  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percantageLabel: '.budget__expenses--percentage'
  };
  
  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };  
    },
    
    addListItem: function(obj, type) {
      var html, newHtml, element;
      // create html string with placeholder text
      
      if (type === 'inc') {
        element = DOMstrings.incomeContainer;
        html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === 'exp') {
        element = DOMstrings.expensesContainer;
        html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      
      // replace the placeholder text with some actual data
      
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', obj.value);
      
      // insert the html into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },
    
    clearFields: function() {
      var fields, fieldsArr;
      
      fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
      
      fieldsArr = Array.prototype.slice.call(fields);
      
      fieldsArr.forEach(function(current, index, array) {
        current.value = "";
      });
      
      fieldsArr[0].focus();
      
    },
    
    displayBudget: function(obj) {
      
      document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
      document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
      document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;
      
      
      if(obj.percentage > 0) {
        document.querySelector(DOMstrings.percantageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percantageLabel).textContent = '---';
      }
      
    },
    
    getDOMstrings: function() {
      return DOMstrings;
    }
    
  };

})();




// global app ctrl
var controller = (function(budgetCtrl, UICtrl) {
  
  var setupEventListeners = function() {
    var DOM = UICtrl.getDOMstrings();
    
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });
  };
  
  var updateBudget = function() {
    
    // calculate the budget
    budgetCtrl.calculateBudget();
    
    
    // return the budget
    var budget = budgetCtrl.getBudget();
    

    // display the budget on the UI
    UICtrl.displayBudget(budget);
    
    
  }


  var ctrlAddItem = function() {
    var input, newItem;
    
    // get the filed input data
    
    var input = UICtrl.getInput();
    
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      
      // add the item to the budget ctrl
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // add the item to the UI
      UICtrl.addListItem(newItem, input.type);

      // clear the fields

      UICtrl.clearFields();

      // calculate and update budget
      updateBudget(); 
    
    }

  };
  
  return {
    init: function() {
      console.log('aaplication has started');
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setupEventListeners();
    }
  };


})(budgetController, UIController);

controller.init();

