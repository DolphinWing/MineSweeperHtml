// mine game javascript ¿…

// mine box style
var MineBox_None = 0;
var MineBox_Mine = -1;
var MineBox_Visited = 100;
var MineBox_Marked = 200;

// mine game status
var MineGame_Ready = 0;
var MineGame_InGame = 10;
var MineGame_GameSet = 20;

// mine map
var m_nMineMapDisplay = new Array(200);
var m_nMineMap = new Array(200);
var m_sMineMapBackground = new Array(200);
//var m_nMineMapMarked = new Array(200);
var m_sMineLocation = new Array();
var m_sMineLocationMarked = new Array();

var i=0;
// initialize(constructor)
for(i=0;i<200;i++) {
    m_nMineMapDisplay[i] = new Array(200);
    m_nMineMap[i] = new Array(200);
    m_sMineMapBackground[i] = new Array(200);
    //m_nMineMapMarked[i] = new Array(200);
}

// global variables
var m_nMapHeight = 10;
var m_nMapWidth = 10;
var m_nMapMine = 10;
var m_nMapArea = m_nMapHeight * m_nMapWidth;
var m_nMineMarked = m_nMapMine;

var m_nGameStatus = MineGame_Ready;

var m_nGameTimer;
var m_nGameTimerDivID;
var m_nGameMinesDivID;

var mine = new Array();   // for the mine location
function init_mine_map(nHeight, nWidth, nMine) {
    m_nGameStatus = MineGame_Ready;
    
    // set to global variables
    m_nMapHeight = nHeight;
    m_nMapWidth = nWidth;
    m_nMapMine = nMine;
    m_nMapArea = m_nMapHeight * m_nMapWidth;
    m_nMineMarked = m_nMapMine;
    
    // initilize all box
    for (var x = 0; x <= m_nMapHeight + 1; x++) {
        for (var y = 0; y <= m_nMapWidth + 1; y++) {
            // mine map clear
            m_nMineMap[x][y] = 0;
            //m_sMineMapBackground[x][y] = new Array(40);
            m_sMineMapBackground[x][y] = "divMineMap_td";
            //m_nMineMapMarked[x][y] = 0;
        }
    }
    
    // set the mine location
    mine = new Array(nMine);
    m_sMineLocation = new Array(nMine);
    m_sMineLocationMarked = new Array(nMine);
    for (var m = 0; m < nMine; m++) {
        //Random rand = new Random();
        mine[m] = Math.floor(Math.random() * m_nMapArea);

        // check the repeat in mine generation
        while (ExistedMine(m)) {
            mine[m] = (mine[m] + 1) % m_nMapArea;
        }

        // mine location
        var h = Math.floor(parseFloat(mine[m]) / m_nMapWidth) + 1;  // leave no 0
        var w = parseFloat(mine[m]) % m_nMapWidth + 1;  // leave no 0
        m_nMineMap[h][w] = MineBox_Mine;
        m_sMineLocation[m] = h + "-" + w;   // locate the mine
    }

    var strMineMapHTML = "<table border='1' cellpadding='0' cellspacing='0' oncontextmenu='event.returnValue=false;'>";    
    // generate the mine button
    for (var h = 1; h <= nHeight; h++) {
        strMineMapHTML += "<tr>";

        for (var w = 1; w <= nWidth; w++) {
            // get mine neighbors
            m_nMineMapDisplay[h][w] = GetNeighborMine(h, w);
            
            strMineMapHTML += "<td id='tdMineBox_"+h+"_"+w+"' class='divMineMap_td' "+GetMineBoxEvent(h,w)+">";
            //strMineMapHTML += (m_nMineMapDisplay[h][w]==MineBox_None) ? "0" : " ";//m_nMineMapDisplay[h][w];
            //strMineMapHTML += "<img src='Mine/box.GIF' />";
			strMineMapHTML += "&nbsp;";
            strMineMapHTML += "</td>";
        }
        
        strMineMapHTML += "</tr>";
    }
    
    strMineMapHTML += "</table>";
    
    mine_game_mine(m_nMineMarked);  // show the mines
    
    return strMineMapHTML;
}

function ExistedMine(len) {
    for (var i = 0; i < len; i++) {
        if (mine[i] == mine[len]) {
            return true;
        }
    }

    return false;
}
function ExistedMine2(h, w) {
    var mineLoc = (h-1)*m_nMapHeight + (w-1);
    for (var i = 0; i < mine.length; i++) {
        if (mine[i] == mineLoc) {
            // store in the matched
            return true;
        }
    }

    return false;
}

function GetNeighborMine(h, w) {
    if (m_nMineMap[h][w] == MineBox_Mine) // mine itself
        return m_nMineMap[h][w];

    // [h-1][w-1] [h-1][w] [h-1][w+1]
    //  [h][w-1]   [h][w]   [h][w+1]
    // [h+1][w-1] [h+1][w] [h+1][w+1]
    var nMine = parseInt(m_nMineMap[h-1][w-1]) + parseInt(m_nMineMap[h-1][w]) + 
        parseInt(m_nMineMap[h-1][w+1]) + parseInt(m_nMineMap[h][w-1]) + parseInt(m_nMineMap[h][w+1]) + 
        parseInt(m_nMineMap[h+1][w-1]) + parseInt(m_nMineMap[h+1][w]) + parseInt(m_nMineMap[h+1][w+1]);

    return Math.abs(nMine);
}

function GetMineBoxEvent(h, w) {
    var str_event = "";
    
    str_event += "onmouseover='mine_box_hover("+h+","+w+")' ";
    str_event += "onmouseout='mine_box_out("+h+","+w+")' ";
    str_event += "onclick='mine_box_click("+h+","+w+")' ";
    str_event += "oncontextmenu='mine_box_contextmenu(event,"+h+","+w+")' ";
	//str_event += "ondblclick='mine_box_contextmenu("+h+","+w+")' ";
    
    return str_event;
}

//var m_cssMineMap = new Array(3);
//for(i=0; i<3; i++) {
//    m_cssMineMap[i] = new Array(3);
//}
function mine_box_hover(h, w) {
    var hoverCss = "divMineMap_td_hover";
    var hoverBoxCss = "divMineMap_td_hover_box";
    var neighborCss = "divMineMap_td_neighbor";
    var neighborBoxCss = "divMineMap_td_neighbor_box";
    
    //m_cssMineMap[1][1] = document.getElementById("tdMineBox_"+h+"_"+w).className;
    document.getElementById("tdMineBox_"+h+"_"+w).className = (m_nMineMap[h][w] == MineBox_Visited) ? hoverCss : hoverBoxCss;
    
    try {   // [h-1][w]
        //m_cssMineMap[0][1] = document.getElementById("tdMineBox_"+(parseInt(h)-1)+"_"+w).className;
        document.getElementById("tdMineBox_"+(parseInt(h)-1)+"_"+w).className = (m_nMineMap[h-1][w] == MineBox_Visited) ? neighborCss : neighborBoxCss;
    }
    catch(e) {}
    try {   // [h-1][w+1]
        //m_cssMineMap[0][2] = document.getElementById("tdMineBox_"+(parseInt(h)-1)+"_"+(parseInt(w)+1)).className;
        document.getElementById("tdMineBox_"+(parseInt(h)-1)+"_"+(parseInt(w)+1)).className = (m_nMineMap[h-1][w+1] == MineBox_Visited) ? neighborCss : neighborBoxCss;
    }
    catch(e) {}
    try {   // [h][w+1]
        //m_cssMineMap[1][2] = document.getElementById("tdMineBox_"+h+"_"+(parseInt(w)+1)).className;
        document.getElementById("tdMineBox_"+h+"_"+(parseInt(w)+1)).className = (m_nMineMap[h][w+1] == MineBox_Visited) ? neighborCss : neighborBoxCss;
    }
    catch(e) {}
    try {   // [h+1][w+1]
        //m_cssMineMap[2][2] = document.getElementById("tdMineBox_"+(parseInt(h)+1)+"_"+(parseInt(w)+1)).className;
        document.getElementById("tdMineBox_"+(parseInt(h)+1)+"_"+(parseInt(w)+1)).className = (m_nMineMap[h+1][w+1] == MineBox_Visited) ? neighborCss : neighborBoxCss;
    }
    catch(e) {}
    try {   // [h+1][w]
        //m_cssMineMap[2][1] = document.getElementById("tdMineBox_"+(parseInt(h)+1)+"_"+w).className;
        document.getElementById("tdMineBox_"+(parseInt(h)+1)+"_"+w).className = (m_nMineMap[h+1][w] == MineBox_Visited) ? neighborCss : neighborBoxCss;
    }
    catch(e) {}
    try {   // [h+1][w-1]
        //m_cssMineMap[2][0] = document.getElementById("tdMineBox_"+(parseInt(h)+1)+"_"+(parseInt(w)-1)).className;
        document.getElementById("tdMineBox_"+(parseInt(h)+1)+"_"+(parseInt(w)-1)).className = (m_nMineMap[h+1][w-1] == MineBox_Visited) ? neighborCss : neighborBoxCss;
    }
    catch(e) {}
    try {   // [h][w-1]
        //m_cssMineMap[1][0] = document.getElementById("tdMineBox_"+h+"_"+(parseInt(w)-1)).className;
        document.getElementById("tdMineBox_"+h+"_"+(parseInt(w)-1)).className = (m_nMineMap[h][w-1] == MineBox_Visited) ? neighborCss : neighborBoxCss;
    }
    catch(e) {}
    try {   // [h-1][w-1]
        //m_cssMineMap[0][0] = document.getElementById("tdMineBox_"+(parseInt(h)-1)+"_"+(parseInt(w)-1)).className;
        document.getElementById("tdMineBox_"+(parseInt(h)-1)+"_"+(parseInt(w)-1)).className = (m_nMineMap[h-1][w-1] == MineBox_Visited) ? neighborCss : neighborBoxCss;
    }
    catch(e) {}
}

function mine_box_out(h, w) {
    //var CssClass = "divMineMap_td";
    //var CssClassClicked = "divMineMap_td_clicked";
    document.getElementById("tdMineBox_"+h+"_"+w).className = m_sMineMapBackground[h][w];
    //document.getElementById("tdMineBox_"+h+"_"+w).className = m_cssMineMap[1][1];
    try {   // [h-1][w]
        //document.getElementById("tdMineBox_"+(parseInt(h)-1)+"_"+w).className = CssClass;
        //document.getElementById("tdMineBox_"+(parseInt(h)-1)+"_"+w).className = m_cssMineMap[0][1];
        document.getElementById("tdMineBox_"+(parseInt(h)-1)+"_"+w).className = m_sMineMapBackground[h-1][w];
    }
    catch(e) {}
    try {   // [h-1][w+1]
        //document.getElementById("tdMineBox_"+(parseInt(h)-1)+"_"+(parseInt(w)+1)).className = CssClass;
        //document.getElementById("tdMineBox_"+(parseInt(h)-1)+"_"+(parseInt(w)+1)).className = m_cssMineMap[0][2];
        document.getElementById("tdMineBox_"+(parseInt(h)-1)+"_"+(parseInt(w)+1)).className = m_sMineMapBackground[h-1][w+1];
    }
    catch(e) {}
    try {   // [h][w+1]
        //document.getElementById("tdMineBox_"+h+"_"+(parseInt(w)+1)).className = CssClass;
        //document.getElementById("tdMineBox_"+h+"_"+(parseInt(w)+1)).className = m_cssMineMap[1][2];
        document.getElementById("tdMineBox_"+h+"_"+(parseInt(w)+1)).className = m_sMineMapBackground[h][w+1];
    }
    catch(e) {}
    try {   // [h+1][w+1]
        //document.getElementById("tdMineBox_"+(parseInt(h)+1)+"_"+(parseInt(w)+1)).className = CssClass;
        //document.getElementById("tdMineBox_"+(parseInt(h)+1)+"_"+(parseInt(w)+1)).className = m_cssMineMap[2][2];
        document.getElementById("tdMineBox_"+(parseInt(h)+1)+"_"+(parseInt(w)+1)).className = m_sMineMapBackground[h+1][w+1];
    }
    catch(e) {}
    try {   // [h+1][w]
        //document.getElementById("tdMineBox_"+(parseInt(h)+1)+"_"+w).className = CssClass;
        //document.getElementById("tdMineBox_"+(parseInt(h)+1)+"_"+w).className = m_cssMineMap[2][1];
        document.getElementById("tdMineBox_"+(parseInt(h)+1)+"_"+w).className = m_sMineMapBackground[h+1][w];
    }
    catch(e) {}
    try {   // [h+1][w-1]
        //document.getElementById("tdMineBox_"+(parseInt(h)+1)+"_"+(parseInt(w)-1)).className = CssClass;
        //document.getElementById("tdMineBox_"+(parseInt(h)+1)+"_"+(parseInt(w)-1)).className = m_cssMineMap[2][0];
        document.getElementById("tdMineBox_"+(parseInt(h)+1)+"_"+(parseInt(w)-1)).className = m_sMineMapBackground[h+1][w-1];
    }
    catch(e) {}
    try {   // [h][w-1]
        //document.getElementById("tdMineBox_"+h+"_"+(parseInt(w)-1)).className = CssClass;
        //document.getElementById("tdMineBox_"+h+"_"+(parseInt(w)-1)).className = m_cssMineMap[1][0];
        document.getElementById("tdMineBox_"+h+"_"+(parseInt(w)-1)).className = m_sMineMapBackground[h][w-1];
    }
    catch(e) {}
    try {   // [h-1][w-1]
        //document.getElementById("tdMineBox_"+(parseInt(h)-1)+"_"+(parseInt(w)-1)).className = CssClass;
        //document.getElementById("tdMineBox_"+(parseInt(h)-1)+"_"+(parseInt(w)-1)).className = m_cssMineMap[0][0];
        document.getElementById("tdMineBox_"+(parseInt(h)-1)+"_"+(parseInt(w)-1)).className = m_sMineMapBackground[h-1][w-1];
    }
    catch(e) {}
}

function mine_box_click(h, w) {
    var mineBox = document.getElementById("tdMineBox_"+h+"_"+w);
    
    if(m_nGameStatus == MineGame_Ready) {
        // start the time counter
        m_nGameStatus = MineGame_InGame;
        m_nGameTimer = window.setInterval("mine_game_timer()", 1000);
    }
    else if(m_nGameStatus == MineGame_GameSet) {
        // prepare for the new game
        return;
    }
    
    if(mineBox.innerText == "?") {
        // not to change it if this is a mark
        return;
    }
    
    m_nMineMap[h][w] = MineBox_Visited;
    mineBox.className = "divMineMap_td_clicked";
    
    // game over
    if(m_nMineMapDisplay[h][w] == -1) {
        // show all the mines
        for(i=0; i<m_nMapMine; i++) {
            var mineShow = document.getElementById("tdMineBox_"+m_sMineLocation[i].replace("-","_"));
            mineShow.innerHTML = "<img src='Mine/mine_noclick.GIF' />";
            mineShow.className = "minebox_mine_noclick";
            
            var msg = m_sMineLocation[i].split('-');
            //alert(msg[0]+","+msg[1]);
            m_sMineMapBackground[msg[0]][msg[1]] = "minebox_mine_noclick";
        }
        
        mineBox.innerHTML = "<img src='Mine/mine_clicked.GIF' />";
        mineBox.className = "minebox_mine_clicked";
        m_sMineMapBackground[h][w] = "minebox_mine_clicked";
        
        mine_game_set();
        
        //alert("Boom!");
        return;
    }
    
    // game goes on
//    mineBox.innerText = m_nMineMapDisplay[h][w];
//    mineBox.className = "divMineMap_td_clicked";
//    m_nMineMapBackground[h][w] = "divMineMap_td_clicked";
    
    //if(m_nMineMapDisplay[h][w] == MineBox_None) {
        mine_box_auto_click(h,w);
    //}
}

//var m_nMapHeight = 10;
//var m_nMapWidth = 10;
function mine_box_auto_click(h, w) {
    if(m_nMineMap[h][w] == MineBox_Marked) {  // amrked as mine
        return;
    }
    
    var mineBox = document.getElementById("tdMineBox_"+h+"_"+w);
    mineBox.className = "divMineMap_td_clicked";

    m_nMineMap[h][w] = MineBox_Visited;
    m_sMineMapBackground[h][w] = "divMineMap_td_clicked";
    switch(m_nMineMapDisplay[h][w]) {
        case MineBox_None:
            mineBox.innerHTML = "";
            break;
        case MineBox_Mine:
            mineBox.innerHTML = "<b>*</b>";
            break;
        default:
            mineBox.innerHTML = m_nMineMapDisplay[h][w];
			//alert(mineBox.innerHTML);
            return;
    }
    
//    //alert(m_nMineMapDisplay[h][w]+","+h+","+w);
//    if(m_nMineMapDisplay[h][w] != MineBox_None) {   // got the value
//        return;
//    }

    //alert(m_nMineMap[h - 1][w]+","+(h-1)+","+w);
    // [h-1][w]
    if (h > 1 && m_nMineMap[h - 1][w] != MineBox_Visited) {  // not visited
        mine_box_auto_click(h - 1, w);
    }
    // [h-1][w+1]
    if (h > 1 && w < m_nMapWidth && m_nMineMap[h - 1][w + 1] != MineBox_Visited) {  // not visited
        mine_box_auto_click(h - 1, w + 1);
    }
    // [h][w+1]
    if (w < m_nMapWidth && m_nMineMap[h][w + 1] != MineBox_Visited) {  // not visited
        mine_box_auto_click(h, w + 1);
    }
    // [h+1][w+1]
    if (h < m_nMapHeight && w < m_nMapWidth && m_nMineMap[h + 1][w + 1] != MineBox_Visited) {  // not visited
        mine_box_auto_click(h + 1, w + 1);
    }
    // [h+1][w]
    if (h < m_nMapHeight && m_nMineMap[h + 1][w] != MineBox_Visited) {  // not visited
        mine_box_auto_click(h + 1, w);
    }
    // [h+1][w-1]
    if (h < m_nMapHeight && w > 1 && m_nMineMap[h + 1][w - 1] != MineBox_Visited) {  // not visited
        mine_box_auto_click(h + 1, w - 1);
    }
    // [h][w-1]
    if (w > 1 && m_nMineMap[h][w - 1] != MineBox_Visited) {  // not visited
        mine_box_auto_click(h, w - 1);
    }
    // [h-1][w-1]
    if (h > 1 && w > 1 && m_nMineMap[h - 1][w - 1] != MineBox_Visited) {  // not visited
        mine_box_auto_click(h - 1, w - 1);
    }
}

function  mine_box_contextmenu(event,h,w) {
    var mineBox = document.getElementById("tdMineBox_"+h+"_"+w);
    try{event.returnValue = false;event.preventDefault();}catch(e){}
    
    if(m_nGameStatus == MineGame_Ready) {
        // start the time counter
        m_nGameStatus = MineGame_InGame;
    }
    else if(m_nGameStatus == MineGame_GameSet) {
        // prepare for the new game
        return false;
    }
    
    var mineLoc = h + "-" + w;
    var mineMark = 0;
    for(mineMark=0; mineMark<m_sMineLocation.length; mineMark++) {
        //bFind = bFind | (m_sMineLocation[x] == m_sMineLocationMarked[y]);
        if(m_sMineLocation[mineMark] == mineLoc) {
            //m_sMineLocationMarked[y] = mineLoc;
            break;
        }
    }
    //alert(mineBox.innerHTML.substring(0,4));
    if(mineBox.innerHTML.substring(0,4).toLowerCase() == "<img") {
        // not to change it if this is a mark
        mineBox.innerHTML = "";
        //return;
        // decrease the mine counter 
        m_nMineMarked++;
        m_sMineLocationMarked[mineMark] = "";
        mine_game_mine(m_nMineMarked);
    }
    
    //alert(m_nMineMarked);
    // check the game mine count, not to give too much mine mark
//    if(m_nMineMarked <= 0) {
//        return;
//    }
//    else {
//        m_nMineMarked--;
//        m_sMineLocationMarked[m_nMineMarked] = h + "-" + w;
//    }
    else if(m_nMineMarked > 0 && m_nMineMap[h][w] != MineBox_Visited){
        mineBox.innerHTML = "<img src='Mine/mine_marked.GIF' />";
        m_nMineMarked--;
        
        m_sMineLocationMarked[mineMark] = mineLoc;
        //m_sMineLocationMarked[m_nMineMarked] = h + "-" + w;
        m_nMineMap[h][w] = MineBox_Marked;
    }
    
    mine_game_mine(m_nMineMarked);
    
    if(m_nMineMarked <= 0) {
        // check if win the game
        //var bFindAll = true;
        for(var x=0; x<m_sMineLocation.length; x++) {
            // check if matched
            if(m_sMineLocation[x] != m_sMineLocationMarked[x]) {
                return false;
            }
            //bFindAll = bFind & bFindAll;
        }
        // wining the game
        mine_game_set();
        alert("You win!");
    }
	return false;
}

var nMineGameTimer = 0;
function mine_game_set() {
    m_nGameStatus = MineGame_GameSet;
    try {
        window.clearInterval(m_nGameTimer); 
    }
    catch(e) {}
    nMineGameTimer = 0;
}

function mine_game_timer() {
    nMineGameTimer++;
    var min = Math.floor(nMineGameTimer / 60);
    var sec = nMineGameTimer % 60;
    
    var timerDisplay = "";
    if(min<10) {
        
        timerDiplay = "0"+min;
    }
    else {
        timerDiplay = min;
    }
    timerDiplay += ":";
    if(sec<10) {
        timerDiplay += "0"+sec;
    }
    else {
        timerDiplay += sec;
    }
    
    try {
        document.getElementById(m_nGameTimerDivID).innerText = timerDiplay;
    }
    catch(e) {}
}

function mine_game_mine(mines) {
    try {
        document.getElementById(m_nGameMinesDivID).innerText = "Mine: " + mines;
    }
    catch(e) {}
    
    // the following is used for the test
    var testOutput = document.getElementById("divGameTestOutput");
    var html = "<table border='1'><tr><td>mine</td><td>x-y</td><td>marked x-y</td></tr>";
    for(i=0; i<m_nMapMine; i++) {
        html += "<tr><td>";
        html += mine[i];
        html += "</td><td>";
        html += m_sMineLocation[i];
        html += "</td><td>";
        html += m_sMineLocationMarked[i];
        html += "</td></tr>";
    }
    html += "</table>";
    //testOutput.innerHTML = html;
}