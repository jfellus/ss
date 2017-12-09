if(!$) var $ = require("jquery");

var firstRow = 1;
var firstCol = 1;
var rows = 0;
var cols = 0;
var t;

var data=[];

var selection = null;

var lastX = -1; var lastY = -1;

function create_grid(h,w) {
  rows = h;
  cols = w;
  for(var i=0; i<w; i++) {
    var r = $("<div class='tc'></div>");
    r.append("<div class='colHeader'>"+(i==0 ? "" : i)+"</div>")
    for(var j=1; j<h; j++) {
      if(i==0) r.append("<div class='rowHeader'>"+(j==0 ? "" : j)+"</div>");
      else r.append($("<div class='cell'></div>").click(handleClick));
    }
    i<t.append(r);
  }
}

function main() {
  t = $(".table");
  create_grid(60,40);

  loadCols(1,40);

  $(document).on("mousewheel", (e) => {
    if(e.originalEvent.deltaY <0) scroll_up();
    else scroll_down();
  });

  $(document).on("mousemove", (e)=> {
    /// TEST ///
    if(!e.ctrlKey) return;
    if(lastX!=-1) {
      resize_col(4, e.clientX-lastX);
    }
    lastX = e.clientX; lastY = e.clientY;
    /////////////
  });

  $(document).on("keydown", (e) => {
    console.log(e.which);
    if(e.ctrlKey) {
      if(e.which === 40) scroll_down();
      else if(e.which === 38) scroll_up();
      else if(e.which === 37) scroll_left();
      else if(e.which === 39) scroll_right();
    }
    else {
      if(e.which === 40) down();
      else if(e.which === 38) up();
      else if(e.which === 37) left();
      else if(e.which === 39) right();
      else if(e.which === 13) {
        validate(selection.i, selection.j);
        down();
      }
      else if(e.which === 27) cancelEdit(selection.i, selection.j);
      else if(selection) edit(selection.i, selection.j);
    }
  });

}


////////////////////


function loadCols(i1, i2) {
  var e = $(t.children()[i1]);
  for(var i=i1; i<=i2; i++) {
    loadCol(e, i+firstCol-1);
    e = e.next();
  }
}


function loadCol(e, j) {
  e.children().each((i,r) => {
    if(i==0) $(r).html(j);
    else loadCell($(r),i+firstRow-1,j);
  })
}

function loadCell(e, i, j) {
  var o = get(i,j); if(!o) o="";
  e.html(o);
  if(isSelected(i,j)) e.css("background", "rgba(255,0,0,0.2)");
  else e.css("background", "none");
}

//////////////////

function get(i,j) {
  if(!data[i]) return null;
  return data[i][j];
}

function set(i,j, o) {
  if(!data[i]) data[i] = [];
  data[i][j] = o;
}

function cell(i,j) {
  return $($(t.children()[j-firstCol+1]).children()[i-firstRow+1]);
}

function cell_j(x) {
  return x.parent().index() + firstCol - 1;
}

function cell_i(x) {
  return x.index() + firstRow - 1;
}

function row_cells(i) {
  return t.children().children(":nth-child("+(i-firstRow+2)+")");
}

function col_cells(j) {
  return t.children(":nth-child("+(j-firstCol+2)+")").children();
}

///////////////////

function isSelected(i,j) {
  if(!selection) return false;
  return selection.i===i && selection.j===j;
}

///////////////////

function scroll_left() {
  if(firstCol<=1) return;
  firstCol--;
  var x = t.children().last();
  x.detach();
  loadCol(x, firstCol);
  t.children().first().after(x);
}

function scroll_right() {
  firstCol++;
  var x = $(t.children()[1]);
  x.detach();
  loadCol(x, firstCol+cols-2);
  t.append(x);
}

function scroll_down() {
  firstRow++;
  t.children().each((j,c) => {
    var x = $($(c).children()[1]);
    x.detach();
    if(j==0) x.html(firstRow+rows-2);
    else loadCell(x, firstRow+rows-2, firstCol+j-1);
    $(c).append(x);
  });
}

function scroll_up() {
  if(firstRow<=1) return;
  firstRow--;
  t.children().each((j,c) => {
    var x = $(c).children().last();
    x.detach();
    if(j==0) x.html(firstRow);
    else loadCell(x, firstRow, firstCol+j-1);
    $(c).children().first().after(x);
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
  if(oldSelection) {
    validate(oldSelection.i, oldSelection.j);
    loadCell(cell(oldSelection.i,oldSelection.j),oldSelection.i,oldSelection.j);
  }
}

function down() {
    if(!selection) return;
    // TODO SCROLL IF LAST VISIBLE ROW -> calculate last visible row !
    if(selection.i>=firstRow+rows-1) scroll_down();
    select(selection.i+1,selection.j);
}

function up() {
    if(!selection) return;
    if(selection.i<=1) return;
    if(selection.i<=firstRow) scroll_up();
    select(selection.i-1,selection.j);
}

function left() {
    if(!selection) return;
    if(selection.j<=1) return;
    if(selection.j<=firstCol) scroll_left();
    select(selection.i,selection.j-1);
}

function right() {
    if(!selection) return;
    // TODO SCROLL IF LAST VISIBLE COL -> calculate last visible col !
    if(selection.j>=firstCol+cols) scroll_right();
    select(selection.i,selection.j+1);
}


///////////////////////

function edit(i,j) {
  cell(i,j).attr("contentEditable", true).focus();
}

function unedit(i,j) {
  cell(i,j).attr("contentEditable", false).blur();
}

function validate(i,j) {
  set(i,j,cell(i,j).html());
  cell(i,j).attr("contentEditable", false).blur();
}

function cancelEdit(i,j) {
  unedit(i,j);
  loadCell(cell(i,j),i,j);
}

///////////////////

function resize_row(i, dh) {
  var h = cell(i,1).height();
  h += dh;
  row_cells(i).height(h);
}

function resize_col(i, dw) {
  var w = $(t.children()[i]).width();
  w += dw;
  $(t.children()[i]).width(w);
}
