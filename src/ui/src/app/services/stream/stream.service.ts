import * as Peer from 'peerjs';
import { Socket, io } from 'socket.io-client';
import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class StreamService {
	private stream?: MediaStream;
	private socket: Socket;
	private peer: Peer;

	constructor() {
		this.socket = io({
			port: 443,
			path: '/socket',
		});
		this.peer = new Peer({
			host: '/',
			port: 443,
			path: '/peer',
			secure: true,
			debug: 3,
		});
	}

	start(stream: MediaStream): void {
		this.stream = stream;
		this.socket.on('viewerJoining', (userId) => {
			this.peer.call(userId, stream);
			console.log(`User ${userId} joined`);
		});
		this.socket.on('viewerLeaving', (userId) => {
			console.log(`User ${userId} left`);
		});
		this.socket.emit('registerStream');
		this.stream.getVideoTracks()[0].addEventListener('ended', () => {
			this.end();
		});
	}

	join(streamId: string): void {}

	leave(streamId: string): void {}

	private end(): void {
		this.socket.emit('deregisterStream');
		this.socket.off('viewerJoining');
		this.socket.off('viewerLeaving');
		this.stream = undefined;
	}
}
