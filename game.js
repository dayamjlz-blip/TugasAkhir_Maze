const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tileSize = 20; 
const cols = 21; 
const rows = 21; 

let map = []; 

for (let y = 0; y < rows; y++) {
    let row = [];
    for (let x = 0; x < cols; x++) {
        row.push(1);
    }
    map.push(row);
}

// ==========================================
// ALGORITMA 1: DFS MAZE GENERATOR
// ==========================================
function generateMaze(startX, startY) {
    map[startY][startX] = 0; 
    let directions = [[2, 0], [-2, 0], [0, 2], [0, -2]];
    directions.sort(() => Math.random() - 0.5);

    for (let i = 0; i < directions.length; i++) {
        let dx = directions[i][0];
        let dy = directions[i][1];
        let nextX = startX + dx;
        let nextY = startY + dy;

        if (nextX > 0 && nextX < cols - 1 && nextY > 0 && nextY < rows - 1 && map[nextY][nextX] === 1) {
            map[startY + dy / 2][startX + dx / 2] = 0; 
            map[nextY][nextX] = 0;
            generateMaze(nextX, nextY);
        }
    }
}
generateMaze(1, 1);

// ==========================================
// KARAKTER PLAYER & MUSUH
// ==========================================
let player = { x: 1, y: 1, color: "#3b82f6" };
// Spawn musuh di pojok kanan bawah
let enemy = { x: cols - 2, y: rows - 2, color: "#ef4444" }; 
let isGameOver = false;

// ==========================================
// ALGORITMA 2: BREADTH-FIRST SEARCH (BFS) MUSUH
// ==========================================
function getNextEnemyMove() {
    // Antrean (Queue) untuk mengecek jalur
    let queue = [{ x: enemy.x, y: enemy.y, path: [] }];
    // Array untuk mencatat grid yang sudah dicek agar tidak bolak-balik
    let visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    visited[enemy.y][enemy.x] = true;

    // Cek Atas, Bawah, Kiri, Kanan
    let directions = [[0, -1], [0, 1], [-1, 0], [1, 0]]; 

    while (queue.length > 0) {
        let current = queue.shift(); // Ambil grid antrean terdepan

        // Jika rute pencarian menyentuh Player
        if (current.x === player.x && current.y === player.y) {
            if (current.path.length > 0) return current.path[0]; // Kembalikan langkah pertama
            return null;
        }

        // Cek ke 4 arah
        for (let i = 0; i < directions.length; i++) {
            let nx = current.x + directions[i][0];
            let ny = current.y + directions[i][1];

            // Pastikan tidak tembus tembok dan belum pernah dicek
            if (nx > 0 && nx < cols - 1 && ny > 0 && ny < rows - 1) {
                if (map[ny][nx] === 0 && !visited[ny][nx]) {
                    visited[ny][nx] = true;
                    queue.push({
                        x: nx,
                        y: ny,
                        path: [...current.path, { x: nx, y: ny }] // Catat jejak rute
                    });
                }
            }
        }
    }
    return null; 
}

// ==========================================
// FUNGSI RENDER (GAMBAR KE KANVAS)
// ==========================================
function drawMap() {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            ctx.fillStyle = map[y][x] === 1 ? "#1f2937" : "#f3f4f6";
            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
    }
}

function drawCharacter(char) {
    ctx.fillStyle = char.color;
    ctx.fillRect((char.x * tileSize) + 2, (char.y * tileSize) + 2, tileSize - 4, tileSize - 4);
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    drawMap(); 
    drawCharacter(player); 
    drawCharacter(enemy); // Gambar musuh
}

function checkGameOver() {
    if (player.x === enemy.x && player.y === enemy.y) {
        isGameOver = true;
        setTimeout(() => alert("GAME OVER! Kamu Tertangkap! Refresh halaman untuk main lagi."), 10);
    }
}

// ==========================================
// KONTROL PLAYER & GAME LOOP
// ==========================================
window.addEventListener("keydown", (e) => {
    if (isGameOver) return; // Kunci kontrol jika sudah kalah

    let newX = player.x;
    let newY = player.y;

    if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") newY--;
    if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") newY++;
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") newX--;
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") newX++;

    if (map[newY][newX] === 0) {
        player.x = newX; 
        player.y = newY;
    }
    update();
    checkGameOver();
});

// TIMER MUSUH: Musuh bergerak otomatis setiap 400 milidetik
setInterval(() => {
    if (!isGameOver) {
        let nextMove = getNextEnemyMove();
        if (nextMove) {
            enemy.x = nextMove.x;
            enemy.y = nextMove.y;
            update();
            checkGameOver();
        }
    }
}, 400);

// Render awal
update();