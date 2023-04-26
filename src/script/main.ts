import { io } from 'socket.io-client';
import { Room } from './types/room.type';
import { RoomCardComponent } from './components/room-card/room-card.component';
import { Player } from './types/player.types';
import { JoinRoom } from './types/joinRoom.types';
import { TicTacToeComponent } from './components/tic-tac-toe/tic-tac-toe.component';
import { TicTacToe } from './types/ticTacToe.types';
import { ClickCell } from './types/clickCell';
import { ModalWinnerComponent } from './components/modal-winner/modal-winner.component';

const socket = io('http://localhost:3000');

let roomCards: RoomCardComponent[] = [];
let currentRoomId: string;
let currentPlayer: Player;

socket.on('getPlayer', (player: Player) => {
    currentPlayer = player;
});

socket.on('updateRooms', (dtoRooms: Room[]) => {
    const roomContainer = document.querySelector('.rooms');

    if (!roomContainer) return;

    roomContainer.replaceChildren();
    roomCards = [];

    dtoRooms.forEach((dtoRoom: Room) => {
        const roomCard = new RoomCardComponent(dtoRoom);
        roomContainer.appendChild(roomCard.getView());
        roomCard.setClickJoin(() => {

            const joinRoomDto: JoinRoom = {
                player: currentPlayer,
                room: dtoRoom,
            };
           socket.emit('joinPlayer', joinRoomDto);
        });

        roomCards.push(roomCard);
    });
});

socket.on('createOrUpdateTicTacToe', (ticTacToeDto: TicTacToe) => {
    console.log('tic tac toe');
    console.log(ticTacToeDto);
    createOrUpdateTicTacToe(ticTacToeDto);
});

socket.on('getCurrentRoom', (currentRoom) => {
    console.log('room id');
    console.log(currentRoom);
    currentRoomId = currentRoom;
});

socket.on('winner', (player: Player) => {
    const body = document.querySelector('body');

    const winnerLabel = `winner with Symbol: ${player.symbol}`;
    const buttonLabel = 'OK';

    const modalWinner = new ModalWinnerComponent(winnerLabel, buttonLabel, () => location.reload());
    body?.append(modalWinner.getView());
});

socket.on('playerExitLobby', () => location.reload());

function createOrUpdateTicTacToe(ticTacToeDto: TicTacToe) {
    const container = document.querySelector('.wrapper__container');

    if (!container) return;

    const ticTacToe = new TicTacToeComponent(ticTacToeDto, (selectedRow: number, selectedColumn: number) => {
        const clickCell: ClickCell = {
            ticTacToeId: ticTacToe.getId(),
            playerId: currentPlayer.id,
            roomId: currentRoomId,
            selectRow: selectedRow,
            selectColumn: selectedColumn,
        };

        console.log('clickCell');
        console.log(clickCell);
        socket.emit('clickCell', clickCell);
    });

    container.replaceChildren();
    container.appendChild(ticTacToe.getView());
}