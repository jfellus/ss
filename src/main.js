if(!$) $ = require("jquery");

var firstRow = 1;
var firstCol = 1;
var rows = 0;
var cols = 0;
var t;

var selection = null;


function create_grid(h,w) {
  rows = h;
  cols = w;
  for(var i=0; i<h; i++) {
    var r = $("<tr></tr>");
    r.append("<th>"+(i==0 ? "" : i)+"</th>")
    for(var j=1; j<w; j++) {
      if(i==0) r.append("<th>"+(j==0 ? "" : j)+"</th>");
      else r.append($("<td></td>").click(handleClick));
    }
    i<t.append(r);
  }
}

function main() {
  t = $("table");
  create_grid(60,40);

  loadRows(1,60);

  $(document).on("mousewheel", (e) => {
    if(e.originalEvent.deltaY <0) up();
    else down();
  });

  $(document).on("keydown", (e) => {
    console.log(e.which);
    if(e.which === 40) down();
    else if(e.which === 38) up();
    else if(e.which === 37) left();
    else if(e.which === 39) right();
  });

}


////////////////////


function loadRows(i1, i2) {
  var e = $(t.children()[i1-firstRow+1]);
  for(var i=i1; i<=i2; i++) {
    loadRow(e, i);
    e = e.next();
  }
}


function loadRow(e, i) {
  e.children().each((j,c) => {
    if(j==0) $(c).html(i);
    else loadCell($(c),i,j+firstCol-1);
  })
}

function loadCell(e, i, j) {
  e.html(data(i,j));
  if(isSelected(i,j)) e.css("background", "rgba(255,0,0,0.2)");
  else e.css("background", "none");
}

//////////////////

function data(i,j) {
  return i==15 && j==15 ? "ok" : "";
}

function cell(i,j) {
  return $($(t.children()[i-firstRow+1]).children()[j-firstCol+1]);
}

function cell_i(x) {
  return x.parent().index() + firstRow - 1;
}

function cell_j(x) {
  return x.index() + firstCol - 1;
}

///////////////////

function isSelected(i,j) {
  if(!selection) return false;
  return selection.i===i && selection.j===j;
}

///////////////////

function up() {
  if(firstRow<=1) return;
  firstRow--;
  var x = t.children().last();
  x.detach();
  loadRow(x, firstRow);
  t.children().first().after(x);
}

function down() {
  firstRow++;
  var x = $(t.children()[1]);
  x.detach();
  loadRow(x, firstRow+rows);
  t.append(x);
}

function right() {
  firstCol++;
  t.children().each((i,r) => {
    var x = $($(r).children()[1]);
    x.detach();
    if(i==0) x.html(firstCol+cols-2);
    else loadCell(x, firstRow+i-1, firstCol+cols);
    $(r).append(x);
  });
}

function left() {
  if(firstCol<=1) return;
  firstCol--;
  t.children().each((i,r) => {
    var x = $(r).children().last();
    x.detach();
    if(i==0) x.html(firstCol);
    else loadCell(x, firstRow+i-1, firstCol);
    $(r).children().first().after(x);
  });
}


////////////////////


function handleClick(e) {
  var x = $(e.target);
  var i = cell_i(x);
  var j = cell_j(x);
  onClick(i,j);
}

function onClick(i,j) {
  select(i,j);
}

function select(i,j) {
  var oldSelection = selection;
  selection = {i:i,j:j};
  loadCell(cell(i,j), i,j);
  if(oldSelection) loadCell(cell(oldSelection.i, oldSelection.j), oldSelection.i, oldSelection.j);
}
