let allCosts = [];
let inputBuy,
  inputCost,
  addButton = null;
let valueBuy,
  valueDate,
  textEditBuy,
  textEditDate = '';
let valueCost,
  textEditCost = 0;
let isEditBuy,
  isEditCost,
  isEditDate = false;

window.onload = init = async () => {
  inputBuy = document.getElementById('buy');
  inputCost = document.getElementById('cost');
  inputBuy.addEventListener('change', updateBuy);
  inputCost.addEventListener('change', updateCost);
  const response = await fetch('http://localhost:8080/costs', {
    method: 'GET'
  });
  let result = await response.json();
  allCosts = result.data;
  await render();
};

const onClickAdd = async () => {
  if (!valueBuy || !valueCost) {
    alert('Заполните все поля!');
    return;
  } else {
    textEditCost = valueCost;
    textEditBuy = valueBuy;
    textEditDate = valueDate;
  }
  const jsonBody = JSON.stringify({
    buy: valueBuy,
    price: +valueCost,
    date: new Date().toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  });
  const response = await fetch('http://localhost:8080/costs', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json;charset=utf-8',
      'Access-control-cross-origin': '*'
    },
    body: jsonBody
  });
  inputBuy.value = null;
  inputCost.value = null;
  valueBuy = '';
  valueDate = '';
  valueCost = 0;
  let res = await response.json();
  allCosts = res.data;
  await render();
};

updateBuy = event => {
  valueBuy = event.target.value;
};

updateCost = event => {
  valueCost = event.target.value;
};

updateColumnBuy = event => {
  textEditBuy = event.target.value;
};

updateColumnCost = event => {
  textEditCost = event.target.value;
};

updateColumnDate = event => {
  const newDate = new Date(event.target.value);
  textEditDate = newDate.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

onClickEdit = async index => {
  clearAllFlags();
  [textEditBuy, textEditCost, textEditDate] = [
    allCosts[index].buy,
    allCosts[index].price,
    allCosts[index].date
  ];
  allCosts[index].isEditCost = true;
  allCosts[index].isEditBuy = true;
  allCosts[index].isEditDate = true;
  await render();
};

fillingFieldsAndRender = async index => {
  [textEditBuy, textEditCost, textEditDate] = [
    allCosts[index].buy,
    allCosts[index].price,
    allCosts[index].date
  ];
  await render();
};

onClickDone = async index => {
  if (!textEditBuy || !textEditCost || !textEditDate || textEditDate === 'Invalid Date') {
    alert('Заполните поля!');
    return;
  }
  if (
    allCosts[index].isEditBuy ||
    allCosts[index].isEditCost ||
    allCosts[index].isEditDate
  ) {
    [allCosts[index].buy, allCosts[index].price, allCosts[index].date] = [
      textEditBuy,
      textEditCost,
      textEditDate
    ];
  }
  allCosts[index].isEditCost = !allCosts[index].isEditCost;
  allCosts[index].isEditBuy = !allCosts[index].isEditBuy;
  allCosts[index].isEditDate = !allCosts[index].isEditDate;
  const response = await fetch('http://localhost:8080/costs', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      _id: allCosts[index]._id,
      buy: textEditBuy,
      price: textEditCost,
      date: textEditDate
    })
  });
  let res = await response.json();
  allCosts = res.data;
  await render();
};

onClickDeleteCost = async index => {
  const response = await fetch(`http://localhost:8080/costs/${allCosts[index]._id}`, {
    method: 'DELETE'
  });
  let result = await response.json();
  allCosts = result;
  await render();
};

// dd.mm.yyyy
parseDate = strVal => {
  const arr = strVal.split('.');
  return new Date(arr[2], arr[1] - 1, arr[0]);
};

//yyyy-mm-dd
formatDate = inputDate => {
  const offset = inputDate.getTimezoneOffset();
  inputDate = new Date(inputDate.getTime() - offset * 60 * 1000);
  return inputDate.toISOString().split('T')[0];
};

clearAllFlags = () => {
  allCosts.forEach(value => {
    value.isEditBuy = false;
    value.isEditCost = false;
    value.isEditDate = false;
  });
};

onClickCancelCost = () => {
  clearAllFlags();
  render();
};

applyChangesAfterBlur = (item, index) => {
  let stateFields = !item.isEditBuy || !item.isEditDate || !item.isEditCost;
  if (stateFields) {
    setTimeout(() => {
      if (stateFields) {
        onClickDone(index);
      }
    }, 300);
  }
};

render = async () => {
  const content = document.getElementById('content-page');
  const totalSum = document.getElementById('total-sum');

  //for count sum
  let count = 0;
  allCosts.forEach(elem => {
    count += +elem.price;
  });
  totalSum.innerText = `${count} p.`;

  while (content.firstChild) {
    content.removeChild(content.firstChild);
  }

  allCosts.map((item, index) => {
    const contentRow = document.createElement('div');
    contentRow.className = 'content-row';
    contentRow.id = `const-${index}`;

    //columns
    const columnBuy = document.createElement('div');
    columnBuy.className = 'column-buy';
    textBuy = item.isEditBuy
      ? document.createElement('input')
      : document.createElement('p');
    textBuy.type = 'text';
    textBuy.value = item.buy;
    textBuy.type = 'text';
    textBuy.innerText = `${index + 1}) Магазин "${item.buy}"`;
    textBuy.className = 'text-buy';
    const state = item.isEditBuy || item.isEditDate || item.isEditCost;
    textDate = item.isEditDate
      ? document.createElement('input')
      : document.createElement('p');
    textDate.className = state ? 'date-buy-input' : 'date-buy';
    textDate.type = 'date';
    if (item.isEditDate) {
      textDate.value = item.date
        ? formatDate(parseDate(item.date))
        : new Date().toISOString().split('T')[0];
    } else {
      textDate.innerText = item.date;
    }
    const columnCost = document.createElement('div');
    columnCost.className = 'column-cost';
    textCost = item.isEditCost
      ? document.createElement('input')
      : document.createElement('p');
    textCost.type = 'number';
    textCost.innerText = `${item.price} p.`;
    textCost.value = item.price;
    textCost.className = 'text-cost';

    textBuy.addEventListener('blur', e => {
      updateColumnBuy(e);
      applyChangesAfterBlur(item, index);
    });

    textDate.addEventListener('blur', e => {
      updateColumnDate(e);
      applyChangesAfterBlur(item, index);
    });

    textCost.addEventListener('blur', e => {
      updateColumnCost(e);
      applyChangesAfterBlur(item, index);
    });

    textBuy.ondblclick = () => {
      if (!allCosts[index].isEditBuy) {
        clearAllFlags();
        allCosts[index].isEditBuy = true;
        fillingFieldsAndRender(index);
      }
    };

    textCost.ondblclick = () => {
      if (!allCosts[index].isEditCost) {
        clearAllFlags();
        allCosts[index].isEditCost = true;
        fillingFieldsAndRender(index);
      }
    };

    textDate.ondblclick = () => {
      if (!allCosts[index].isEditDate) {
        clearAllFlags();
        allCosts[index].isEditDate = true;
        fillingFieldsAndRender(index);
      }
    };

    //icons
    const columnIcons = document.createElement('div');
    columnIcons.className = 'column-icons';
    const iconEdit = document.createElement('i');
    iconEdit.className = 'fas fa-pen';
    const iconDone = document.createElement('i');
    iconDone.className = 'fas fa-check';
    iconDone.id = 'done';
    const iconDelete = document.createElement('i');
    iconDelete.className = 'fas fa-trash-alt';
    const iconCancel = document.createElement('i');
    iconCancel.className = 'fas fa-times';

    iconEdit.onclick = () => {
      onClickEdit(index);
    };

    iconDone.onclick = () => {
      onClickDone(index);
    };

    iconDelete.onclick = () => {
      onClickDeleteCost(index);
    };

    iconCancel.onclick = () => {
      onClickCancelCost(index);
    };

    let stateIfAllFields = item.isEditBuy && item.isEditDate && item.isEditCost;
    iconDone.style.display = stateIfAllFields ? 'block' : 'none';
    iconCancel.style.display = stateIfAllFields ? 'block' : 'none';
    iconEdit.style.display = stateIfAllFields ? 'none' : 'block';
    iconDelete.style.display = stateIfAllFields ? 'none' : 'block';

    columnIcons.appendChild(iconEdit);
    columnIcons.appendChild(iconDone);
    columnIcons.appendChild(iconDelete);
    columnIcons.appendChild(iconCancel);
    columnBuy.appendChild(textBuy);
    columnBuy.appendChild(textDate);
    columnCost.appendChild(textCost);
    contentRow.appendChild(columnBuy);
    contentRow.appendChild(columnCost);
    contentRow.appendChild(columnIcons);
    content.appendChild(contentRow);
  });
};
