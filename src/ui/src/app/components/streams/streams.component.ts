import {
	AfterViewInit,
	Component,
	ElementRef,
	OnDestroy,
	OnInit,
	TemplateRef,
	ViewChild,
	ViewContainerRef,
} from '@angular/core';
import { BehaviorSubject, finalize } from 'rxjs';
import { DarkModeService } from 'src/app/services/dark-mode.service';
import { StreamData } from 'src/app/models/stream-data';
import { StreamService } from 'src/app/services/stream.service';

@Component({
	selector: 'app-streams',
	templateUrl: './streams.component.html',
	styleUrls: ['./streams.component.scss'],
})
export class StreamsComponent implements OnInit, AfterViewInit, OnDestroy {
	@ViewChild('streamCardsContainer', { read: ViewContainerRef })
	streamCardsContainer!: ViewContainerRef;
	@ViewChild('streamCardTemplate', { read: TemplateRef })
	streamCardTemplate!: TemplateRef<StreamData>;
	@ViewChild('loader') private loader!: ElementRef<HTMLDivElement>;
	private smallInputWidth: string;
	private standardInputWidth: string;
	private inputWidthChangeThreshold: number;
	appearance$: BehaviorSubject<string>;
	inputWidth$: BehaviorSubject<string>;
	searchPhrase$: BehaviorSubject<string>;
	smallerScreen: MediaQueryList;
	standardScreen: MediaQueryList;
	intersectionObserver: IntersectionObserver;
	isLoading: boolean;

	constructor(private darkModeService: DarkModeService, private streamService: StreamService) {
		this.smallInputWidth = '300px';
		this.standardInputWidth = '550px';
		this.inputWidthChangeThreshold = 650;
		this.appearance$ = new BehaviorSubject<string>('');
		this.inputWidth$ = new BehaviorSubject<string>(
			window.innerWidth < this.inputWidthChangeThreshold
				? this.smallInputWidth
				: this.standardInputWidth
		);
		this.searchPhrase$ = new BehaviorSubject<string>('');
		this.smallerScreen = window.matchMedia(
			'(max-width: ' + this.inputWidthChangeThreshold + 'px)'
		);
		this.standardScreen = window.matchMedia(
			'(min-width: ' + this.inputWidthChangeThreshold + 'px)'
		);
		this.intersectionObserver = new IntersectionObserver(
			(entries) => {
				const loader = entries[0];
				if (loader.isIntersecting) {
					this.loadStreams();
				}
			},
			{
				threshold: 1,
			}
		);
		this.isLoading = false;
	}

	ngOnInit(): void {
		this.darkModeService.bindAppearance(this.appearance$);
	}

	ngAfterViewInit(): void {
		this.setScreenChangeListeners();
		this.intersectionObserver.observe(this.loader.nativeElement);
	}

	ngOnDestroy(): void {
		this.removeScreenChangeListeners();
	}

	private setScreenChangeListeners(): void {
		this.smallerScreen.addEventListener('change', (event) => this.setSmallInputWidth(event));
		this.standardScreen.addEventListener('change', (event) =>
			this.setStandardInputWidth(event)
		);
	}

	private removeScreenChangeListeners(): void {
		this.smallerScreen.removeEventListener('change', (event) => this.setSmallInputWidth(event));
		this.standardScreen.removeEventListener('change', (event) =>
			this.setStandardInputWidth(event)
		);
	}

	private setSmallInputWidth(event: MediaQueryListEvent): void {
		if (event.matches) {
			this.inputWidth$.next(this.smallInputWidth);
		}
	}

	private setStandardInputWidth(event: MediaQueryListEvent): void {
		if (event.matches) {
			this.inputWidth$.next(this.standardInputWidth);
		}
	}

	private loadStreams(): void {
		this.isLoading = true;
		this.streamService
			.fetchAll()
			.pipe(finalize(() => (this.isLoading = false)))
			.subscribe((streams) => {
				streams.forEach((stream) => {
					this.createStreamCard(stream);
				});
			});
	}

	private createStreamCard(stream: StreamData): void {
		const streamCard = this.streamCardTemplate.createEmbeddedView({
			id: stream.id,
			author: stream.author,
			creationTime: stream.creationTime,
		});
		this.streamCardsContainer.insert(streamCard);
	}
}
