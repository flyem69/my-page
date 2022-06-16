import { Socket, io } from 'socket.io-client';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import Peer from 'peerjs';
import { StreamData } from 'src/app/models/stream-data';

@Injectable({
	providedIn: 'root',
})
export class StreamService {
	private stream?: MediaStream;
	private socket: Socket;
	private peer: Peer;

	constructor(private httpClient: HttpClient) {
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
		this.socket.emit('startStream');
		this.stream.getVideoTracks()[0].addEventListener('ended', () => {
			this.endStream();
		});
	}

	join(streamId: string): void {}

	leave(streamId: string): void {}

	fetchAll(): Observable<StreamData[]> {
		return this.httpClient.get<StreamData[]>('/api/streams');
	}

	private endStream(): void {
		this.socket.emit('endStream');
		this.socket.off('viewerJoining');
		this.socket.off('viewerLeaving');
		this.stream = undefined;
	}
}
