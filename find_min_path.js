//Dựng lên 1 danh sách các con đường có trọng số
var roads = [
    "Alice's House-Bob's House-2",   
    "Alice's House-Cabin-4",
    "Alice's House-Post Office-5",   
    "Bob's House-Town Hall-7",
    "Daria's House-Ernie's House-6", 
    "Daria's House-Town Hall-2",
    "Ernie's House-Grete's House-1", 
    "Grete's House-Farm-3",
    "Grete's House-Shop-4",          
    "Marketplace-Farm-6",
    "Marketplace-Post Office-9",     
    "Marketplace-Shop-2",
    "Marketplace-Town Hall-3",       
    "Shop-Town Hall-5"
];
  
// Hàm xây dựng danh sách kề với các đường đi ở trên
  function buildGraph(edges) {	
      let graph = Object.create(null);
      //Thêm cạnh vào đồ thị
      function addEdge(from, to, weight) {	
          if (graph[from] == null) {
              graph[from] = [[to, weight]];
          }
          else {
              graph[from].push([to, weight]);
          }
      }
      //Lấy ra danh sách các đỉnh bằng cách tách xâu
      for (let [from, to, weight] of edges.map(r => r.split("-"))) { 
          addEdge(from, to, weight);
          addEdge(to, from, weight);
      }
      return graph;
  }

  //Xây dựng danh sách bao gồm các địa điểm
  function buildNodes(edges) {
    let Nodes = [];
    //Thêm 1 node vào danh sách các Node 
    function addNodes(node) {
        // Nếu chưa thêm node này thì thêm vào danh sách
      if (!Nodes.some(n  => n == node)) {
        Nodes.push(node);
      }
    }
    //Lấy ra danh sách đường đi để thêm các node vào danh sách 
    for (let [from, to, weight] of edges.map(r => r.split("-"))) {
      addNodes(from);
      addNodes(to);
    }
    return Nodes;
  }

  //Xây dựng đường đi và danh sách node ban đầu
  const nodes = buildNodes(roads);
  const roadGraph = buildGraph(roads);

  //Hàm lấy ngẫu nhiên 1 phần tử trong dãy
  function randomPick(array) {	
    let choice = Math.floor(Math.random() * array.length);
    return array[choice];
  }

  let minDist = []; //Độ dài đường đi ngắn nhất từ điểm bắt dầu đến điểm hiện tại
  // tạo điểm ngẫu nhiên bắt đầu và kết thúc
  const start = randomPick(nodes);
  let destination;
  do {
    destination = randomPick(nodes);
  }
  while (start == destination);

  //In ra điểm bắt đầu và kết thúc
  console.log(`Robot starts at ${start}`);
  console.log(`Finished at ${destination}`);
  
  //Khởi tạo giá trị ban đầu của độ dài đường đi ngắn nhất
  for (let i of nodes) {
    if (i == start) {
      minDist[i] = 0;
    }
    else {
      minDist[i] = Infinity;
    }
  }

  //Tìm kiếm theo chiều sâu để cập nhật độ dài đường đi
  function BFS(curPlace, curWeight) {
    for (let [next, weight] of roadGraph[curPlace]) {
        //Cập nhật độ dài đường đi ngắn nhất của điểm đến tiếp theo
      if (minDist[next] > curWeight + (weight*1)) {
        minDist[next] = curWeight + (weight*1);
        BFS(next, curWeight + (weight*1));
      }
  }
}

  //Bắt đầu xây dựng danh sách độ dài đường đi ngắn nhất của các địa điểm bắt đầu từ điểm xuất phát
  BFS(start, 0);

  console.log(`Danh sách độ dài đường đi ngắn nhất kể từ điạ điểm ${start} :`);

  for (let i of nodes) {
    console.log(i + ':' + minDist[i]);
  }

  let visited = []; //Đánh dấu đã đến địa điểm nào đó hay chưa
  let trace = Object.create(null); //Mảng truy vết

  //Khởi tạo mảng đánh dấu ban đầu 
  for (let i of nodes) {
      visited[i] = false;
  }

  //Xây dựng danh sách truy vết
 /*
    Ý tưởng: Ví dụ đường đi ngắn nhất từ điểm bắt đầu -> kết thúc có đi qua cạnh nối A-B
    cạnh A sẽ nằm trong danh sách truy vết của B nếu như độ dài đường đi ngắn nhất đén A + dộ dài đường A-B vừa đúng bằng độ dài đường đi ngắn nhất đến B
 */   
  function DFS(curPlace) {
      if (curPlace == destination) return;

      for (let [next, weight] of roadGraph[curPlace]) {
          //Nếu như điểm next thỏa mãn ý tưởng thì truy vết của next có thêm curPlace
        if (minDist[curPlace] + weight * 1 == minDist[next]) {
            if (trace[next] == null) trace[next] = [curPlace];
            else {
                //Nếu địa điểm hiện tại chưa nằm trong danh sách truy vết thì thêm vào 
                if (!trace[next].some(t => t == curPlace)) {
                    trace[next].push(curPlace);
                }
            }
            //Nếu điểm next chưa đi qua thì đánh dấu lại và tiếp tục với điểm next
            if (visited[next] == false) {
                DFS(next, minDist[next]);
                visited[next] = true;
            }
        }
      }
  }

  //Bắt đầu xây dựng
  DFS(start);
  
  let pathCount = 0;// Số đường đi thỏa mãn

  //Hàm in ra danh sách các đường đi thỏa mãn
  function DFS2(curPlace, curPath) {

    //Đã truy vết xong 1 đường
    if (curPlace == start) {
      let path = curPath.reverse();
      pathCount++;
      path.push(destination);
      //In ra đường đi
      console.log(`Path number ${pathCount}:`);
      console.log(path);
    }

    //Nếu chưa đi hết danh sách truy vết thì tiếp tục
    if (trace[curPlace]) {
        // Tiến hành truy vết
      for (let prev of trace[curPlace]) { 
          // Chưa có phần tử trong danh sách đường
        if (!curPath) {
          curPath = [prev];
        }
        else {
          curPath.push(prev);
        }
        DFS2(prev, curPath);
        curPath.pop();
      }
    }
  }
  
  //In ra danh sách đường đi ngắn nhất
  DFS2(destination, null);