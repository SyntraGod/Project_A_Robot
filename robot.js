//runRobotAnimation
(function() {
    "use strict";
  
    let active = null;
    
    //Khởi tạo tọa độ của các điểm đến trên bản đồ
    const places = {
      "Alice's House": { x: 279, y: 100 },
      "Bob's House": { x: 295, y: 203 },
      Cabin: { x: 372, y: 67 },
      "Daria's House": { x: 183, y: 285 },
      "Ernie's House": { x: 50, y: 283 },
      Farm: { x: 36, y: 118 },
      "Grete's House": { x: 35, y: 187 },
      Marketplace: { x: 162, y: 110 },
      "Post Office": { x: 205, y: 57 },
      Shop: { x: 137, y: 212 },
      "Town Hall": { x: 202, y: 213 }
    };
    const placeKeys = Object.keys(places);
  
    const speed = 2;
  
    class Animation {
      constructor(worldState, robot, robotState) {
        this.worldState = worldState;
        this.robot = robot;
        this.robotState = robotState;
        this.turn = 0;
  
        let outer = window.__sandbox
            ? window.__sandbox.output.div
            : document.body,
          doc = outer.ownerDocument;
        this.node = outer.appendChild(doc.createElement("div"));
        this.node.style.cssText =
          "position: relative; line-height: 0.1; margin-left: 10px";
        this.map = this.node.appendChild(doc.createElement("img"));
        this.map.src = "http://eloquentjavascript.net/img/village2x.png";
        this.map.style.cssText = "vertical-align: -8px";
        this.robotElt = this.node.appendChild(doc.createElement("div"));
        this.robotElt.style.cssText = `position: absolute; transition: left ${0.8 /
          speed}s, top ${0.8 / speed}s;`;
        let robotPic = this.robotElt.appendChild(doc.createElement("img"));
        robotPic.src = "http://eloquentjavascript.net/img/robot_moving2x.gif";
        this.parcels = [];
  
        this.text = this.node.appendChild(doc.createElement("span"));
        this.button = this.node.appendChild(doc.createElement("button"));
        this.button.style.cssText =
          "color: white; background: #28b; border: none; border-radius: 2px; padding: 2px 5px; line-height: 1.1; font-family: sans-serif; font-size: 80%";
        this.button.textContent = "Stop";
  
        this.button.addEventListener("click", () => this.clicked());
        this.schedule();
  
        this.updateView();
        this.updateParcels();
  
        this.robotElt.addEventListener("transitionend", () =>
          this.updateParcels()
        );
      }
  
      updateView() {
        let pos = places[this.worldState.place];
        this.robotElt.style.top = pos.y - 38 + "px";
        this.robotElt.style.left = pos.x - 16 + "px";
  
        this.text.textContent = ` Turn ${this.turn} `;
      }
  
      updateParcels() {
        while (this.parcels.length) this.parcels.pop().remove();
        let heights = {};
        for (let { place, address } of this.worldState.parcels) {
          let height = heights[place] || (heights[place] = 0);
          heights[place] += 14;
          let node = document.createElement("div");
          let offset = placeKeys.indexOf(address) * 16;
          node.style.cssText =
            "position: absolute; height: 16px; width: 16px; background-image: url(http://eloquentjavascript.net/img/parcel2x.png); background-position: 0 -" +
            offset +
            "px";
          if (place == this.worldState.place) {
            node.style.left = "25px";
            node.style.bottom = 20 + height + "px";
            this.robotElt.appendChild(node);
          } else {
            let pos = places[place];
            node.style.left = pos.x - 5 + "px";
            node.style.top = pos.y - 10 - height + "px";
            this.node.appendChild(node);
          }
          this.parcels.push(node);
        }
      }
  
      tick() {
        let { direction, memory } = this.robot(this.worldState, this.robotState);
        this.worldState = this.worldState.move(direction);
        this.robotState = memory;
        this.turn++;
        this.updateView();
        if (this.worldState.parcels.length == 0) {
          this.button.remove();
          this.text.textContent = `Finished after ${this.turn} turns`;
          this.robotElt.firstChild.src =
            "http://eloquentjavascript.net/img/robot_idle2x.png";
        } else {
          this.schedule();
        }
      }
  
      schedule() {
        this.timeout = setTimeout(() => this.tick(), 1000 / speed);
      }
  
      clicked() {
        if (this.timeout == null) {
          this.schedule();
          this.button.textContent = "Stop";
          this.robotElt.firstChild.src =
            "http://eloquentjavascript.net/img/robot_moving2x.gif";
        } else {
          clearTimeout(this.timeout);
          this.timeout = null;
          this.button.textContent = "Start";
          this.robotElt.firstChild.src =
            "http://eloquentjavascript.net/img/robot_idle2x.png";
        }
      }
    }
  
    window.runRobotAnimation = function(worldState, robot, robotState) {
      if (active && active.timeout != null) clearTimeout(active.timeout);
      active = new Animation(worldState, robot, robotState);
    };
  })();

//Khởi tạo danh sách các đường đi trong bản đồ
// 14 đường đi nối 2 địa điểm cách nhau bởi dấu "-"
var roads = [
    "Alice's House-Bob's House",   
    "Alice's House-Cabin",
    "Alice's House-Post Office",   
    "Bob's House-Town Hall",
    "Daria's House-Ernie's House", 
    "Daria's House-Town Hall",
    "Ernie's House-Grete's House", 
    "Grete's House-Farm",
    "Grete's House-Shop",          
    "Marketplace-Farm",
    "Marketplace-Post Office",     
    "Marketplace-Shop",
    "Marketplace-Town Hall",       
    "Shop-Town Hall"
];

//Xây dựng  các cạnh
function buildGraph(edges){
    let graph = Object.create(null);
    // Tạo các cạnh của đồ thị bằng cách nối 2 đỉnh from, to
    function addEdge(from, to){
        if(graph[from] == null) // Nếu chưa được nối với nhau thì tạo đường đi bằng cách nối 2 đỉnh lại 
            graph[from] = [to];
        else {
            graph[from].push(to); // Nếu dã được nối thì thêm to vào danh sách các đỉnh có thể đến được từ from
        }
    }
    //Lấy ra danh sách các đỉnh bằng cách phân tích các xâu cạnh tách nhau bởi dấu "-"
    for(let [from, to] of edges.map(r => r.split("-"))) {
        //Tiến hành thêm các danh sách đỉnh để tạo cạnh
        addEdge(from,to);
        addEdge(to,from);
    }
    return graph;
}

// Tạo đồ thị đường đi từ mảng đường đi đã tạo
const roadGraph =  buildGraph(roads);

//
class VillageState{
    // Khởi tạo các địa điểm và giá trị của các bưu kiện
    constructor(place, parcels){
        this.place = place;
        this.parcels = parcels;
    }
    //Hàm di chuyển
    //Mỗi khi di chuyển tới địa điểm mới, địa chỉ của bưu kiện cũ sẽ được coppy thành địa chỉ của điểm đến mới
    //Object parcel có 2 keys là: place: Địa chỉ hiện tại của bưu kiện và address: Địa chỉ cần giao bưu kiện đến
    move(destination){
        //Nếu điểm đến không thể đến được từ địa điểm hiện tại thì quay trở lại địa điểm trước khi di chuyển
        if(!roadGraph[this.place].includes(destination)){
            return this;
        } else {
            //Chuyển đến địa điểm tiếp theo mà chưa đi qua để lấy bưu kiện
            let parcels = this.parcels.map(p => {
                //kiểm tra xem dịa điểm của bưu kiện có khác địa điểm hiện tại đang xét hay không (tức là đã đi qua hay chưa)
                if(p.place != this.place) return p;
                //Chỉnh sửa thông tin của kiện hàng: chuyển địa điểm hiện tại sang điểm đến tiếp theo
                return { place: destination , address: p.address};    
            }).filter(p => p.place != p.address); //Di chuyển đến khi tới địa chỉ cần giao thì dừng
            return new VillageState(destination, parcels); //Di chuyển đến địa điểm mới
        }
    }
}


//Hàm di chuyển của robot
//state là trạng thái hiện tại của robot, memery là quãng đường trong bộ nhớ robot
function runRobot(state, robot, memory) {
    let turn;
    for(turn = 0; ; turn++){
        //Đã giao hết các bưu kiện -> in ra số turn
        if(state.parcels.length == 0){
            console.log(`done in ${turn} turns`)
            break;
        }
        //Hành động tiếp theo của robot
        let action = robot(state, memory);
        //Trạng thái tiếp theo của robot là di chuyển theo hướng của action
        state = state.move(action.direction);
        memory = action.memory;
        console.log(`Move to ${action.direction}`);
    }
    return turn;
}

//Hàm randomPick sẽ lấy ra 1 phần tử ngẫu nhiên từ 0 đến array.length - 1
function randomPick(array){
    let choice = Math.floor(Math.random() * array.length);
    return array[choice];
}

//hàm randomRobot dùng để khởi tạo trạng thái đầu tiên của robot
function randomRobot(state){
  //Hướng đi sẽ được lấy ngẫu nhiên từ các địa điểm trong bản đồ
    return {direction: randomPick(roadGraph[state.place])};
}

//tạo 1 trạng thái ngẫu nhiên của village
//Số bưu kiện cho mặc định là 5
VillageState.random = function(parcelCount = 5) {
    let parcels = [];
    for (let i = 0; i < parcelCount; i++) {
        //Gán địa chỉ cần giao của các bưu kiện là các địa chỉ ngẫu nhiên trên bản đồ
        let address = randomPick(Object.keys(roadGraph));
        //Gán vị trí hiện tại của các bưu kiện cũng là địa chỉ ngẫu nhiên trên bản đồ
        //Tuy nhiên đảm bảo địa chỉ ban đầu và địa chỉ cần giao khác nhau nên sử dụng vòng lặp do while
        let place;
        do {
            place = randomPick(Object.keys(roadGraph));
        } while (place == address);
        parcels.push({place, address});
    }
    return new VillageState("Post Office", parcels);
};

//Tạo sẵn 1 tuyến đường đi
var mailRoute = [
    "Alice's House", 
    "Cabin", 
    "Alice's House", 
    "Bob's House",
    "Town Hall", 
    "Daria's House", 
    "Ernie's House",
    "Grete's House", 
    "Shop", 
    "Grete's House", 
    "Farm",
    "Marketplace", 
    "Post Office"
];

//Chỉ định sẵn cho robot 1 tuyến đường đi cụ thể 
function routeRobot(state, memory) {
    if (memory.length == 0) {
        memory = mailRoute;
    }
    //Địa điểm đầu tiên cần đi là phần tử memory[0]; các địa điểm cần đi còn lại đc lưu trong bộ nhớ robot bắt đầu từ phần tử memory[1]
    return {direction: memory[0], memory: memory.slice(1)};
}

//Hàm tìm 1 đường đi (Robot tự tìm 1 đường đi của mình)
function findRoute(graph, from, to) {
    //Tạo danh sách đường đi với điểm bắt đầu là from, tuyến đường đi chưa tồn tại
    let work = [{at: from, route: []}];
    for (let i = 0; i < work.length; i++) {
        //Lấy ra công việc đầu tiên với: at: địa điểm bắt đầu, route: danh sách các điểm cần đi
        let {at, route} = work[i];
        //Lấy ra tất cả địa điểm có thể đến được từ điểm at
        for (let place of graph[at]) {
            //Nếu địa điểm hiện tại là điểm cần đến thì thêm place vào tuyến đường đi của robot
            if (place == to) return route.concat(place);
            //Nếu địa điểm này chưa được đi tới thì tạo 1 tuyến đường đi mới bắt đầu tử điểm này để đảm bảo danh sách đường đi là ngắn nhất
            if (!work.some(w => w.at == place)) {
                work.push({at: place, route: route.concat(place)});
        }
      }
    }
}

function goalOrientedRobot({place, parcels}, route) {
    //Nếu chưa có tuyến đường cần đi
    if (route.length == 0) {
      //Lấy ra thông tin bưu kiện đầu tiên
      let parcel = parcels[0];
      //Nếu bưu kiện đã được lấy đi thì tiếp tục tuyến đường còn ngược lại thì sẽ lấy bưu kiện đi và giao đến nơi cần giao của bưu kiện
      if (parcel.place != place) {
        route = findRoute(roadGraph, place, parcel.place);
      } else {
        route = findRoute(roadGraph, place, parcel.address);
      }
    }
    //Hướng đi đầu tiên là địa điểm đầu tiên trong tuyến đường đi của robot, lưu trữ các địa điểm cần đi còn lại vào memory của robot
    return {direction: route[0], memory: route.slice(1)};
}

//chạy thử
runRobotAnimation(VillageState.random(),goalOrientedRobot,[]);

//Bài tập 1
function ex1(){
    function compareRobots(robot1, memory1, robot2, memory2) {
        turn1 = runRobot(VillageState.random(),robot1, memory1);
        turn2 = runRobot(VillageState.random(),robot2, memory2);
        return [turn1, turn2];
    }

    let sum1=sum2=0;
    for(let i = 1; i<=100; ++i)
    {
        let [a1,a2] = compareRobots(routeRobot, [], goalOrientedRobot, []);
        sum1+=a1;
        sum2+=a2;
    }
    console.log(sum1/100, sum2/100);
}
                  
