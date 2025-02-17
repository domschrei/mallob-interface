import React from 'react';
import { StreamEventManager } from './StreamEventManager';
import { PastEventManager } from './PastEventManager';
import { JobStorage } from '../model/JobStorage';
import { TimeManager } from './TimeManager';
import { Visualization } from '../view/Visualization';
import './VisualizationPageManager.scss';
import { TimelineComponent } from '../view/TimelineComponent';
import { GlobalStatsComponent } from '../view/GlobalStatsComponent';
import { DetailsComponent } from '../view/DetailsComponent';
import { BinaryTree } from '../view/BinaryTree';
/**
 * This class is responsivle for updating the whole page and managing all the parts.
 *
 * @author Simon Giek
 * @extends React.Component
 */
export class VisualizationPageManager extends React.Component {
	#timeManager;
	#eventManager;
	#jobStorage;
	#context;
	#visualizationRef;
	#visualization;
	#timeLineComponent;
	#globalStatsComponent;
	#detailsComponent;
	#stateLoaded;
	#shouldUpdate;
	#binaryTree;
	#binaryTreeRef;
	#showDetailsPanel;
    /**
     * The constructor.
     *
     * @param {Object} props 
     * @param {Object} props.context - The context used by the page.
     */
	constructor(props) {
		super(props);
		this.#context = props.context;
		this.#timeManager = new TimeManager();
		this.#eventManager = new StreamEventManager(this.#timeManager);
		this.#jobStorage = new JobStorage(this.#context);
		this.#visualizationRef = React.createRef();
		this.#binaryTreeRef = React.createRef();
		this.#timeLineComponent = React.createRef();
		this.#globalStatsComponent = React.createRef();
		this.#detailsComponent = React.createRef();
		this.#stateLoaded = false;
		this.#showDetailsPanel = true;
        this.#shouldUpdate = false;
	}
	shouldComponentUpdate(nextProps) {
		this.#context = nextProps.context;

		this.#jobStorage.updateContext(nextProps.context);
		this.#timeLineComponent.updateContext(nextProps.context);
		if (this.#context.userContext.user.isLoaded) {
			this.update();
		}
		return true;
	}

	componentDidMount() {
		this.#context.jobContext.fetchMostJobsPossible();
		this.#visualization = new Visualization(
			this.#visualizationRef,
			this.update.bind(this),
			this.#context.settingsContext.settings.amountProcesses,
			this.#jobStorage,
			this.onClick.bind(this)
		);
		this.#binaryTree = new BinaryTree(
			this.#jobStorage,
			this.#binaryTreeRef,
			this.#context.settingsContext.settings.amountProcesses
		);
		this.#jobStorage.addJobUpdateListener(this.#binaryTree);
		this.#jobStorage.addJobUpdateListener(this.#visualization);
		this.#eventManager.getSystemState(this.#context.userContext).then((res) => {
			this.#jobStorage.addEvents(res);
			this.#stateLoaded = true;
		});
        this.#shouldUpdate = true;
	}

	componentWillUnmount() {
		this.#shouldUpdate = false;
		this.#eventManager.closeStream();
		this.#visualization.stop();
		this.#visualization = null;
		this.#eventManager = null;
		this.#jobStorage = null;
	}
    /**
     * Updates the displayed view.
     *
     */
	update() {
		if (!this.#shouldUpdate) {
			return;
		}
		try {
			this.#timeManager.getNextTime();
			// jump is required => reload the system state etc.
			if (this.#timeManager.getJump()) {
				this.#stateLoaded = false;
				this.#eventManager.closeStream();
				this.#jobStorage.reset();
				if (this.#timeManager.isLive()) {
					this.#eventManager = new StreamEventManager(this.#timeManager);
				} else {
					this.#eventManager = new PastEventManager(this.#timeManager);
				}

				this.#eventManager
					.getSystemState(this.#context.userContext)
					.then((res) => {
						this.#jobStorage.addEvents(res);
						this.#stateLoaded = true;
					});
			}
			if (this.#stateLoaded) {
				let newEvents = this.#eventManager.getNewEvents(
					this.#context.userContext
				);
				this.#jobStorage.addEvents(newEvents);
			}
			this.#timeLineComponent.update();
			this.#globalStatsComponent.update();
			this.#detailsComponent.update();
			this.#timeManager.updateTime();
		} catch (e) {
			if (this.#shouldUpdate) {
				try {
					this.#context.infoContext.handleInformation(
						e.getMessage(),
						e.getType()
					);
				} catch (f) {
					console.error(e.message);
				}
			}
		}
	}

    /**
     * Tells the class BinaryTree and DetailsComponent which job and which index has been clicked on in the binarytree.
     *
     * @param {int} jobID - The ID of the job which was clicked on.
     * @param {int} treeIndex - The index of the vertex which was clicked on.
     */
	onClick(jobID, treeIndex) {
		this.#detailsComponent.setClicked(jobID, treeIndex);
		if (jobID !== null) {
			this.#binaryTree.displayTree(jobID, treeIndex);
		} else {
			this.#binaryTree.clearTree();
		}
	}

	render() {
		return (
			<div className='visPageContainer'>
				<div className='row g-0'>
					<div
						className={`col-12 col-md-${
							this.#showDetailsPanel ? 6 : 12
						} visualizationHalf d-flex align-items-center justify-content-center`}
					>
						<div className='halfContainer d-flex flex-column align-items-center'>
							<div className='visCanvasContainer '>
								<div
									className='visualizationCanvas'
									ref={(el) => (this.#visualizationRef = el)}
								></div>
							</div>
							<TimelineComponent
								timeManager={this.#timeManager}
								context={this.#context}
								ref={(el) => (this.#timeLineComponent = el)}
                                toggleDetails={() =>{ 
                                    this.#showDetailsPanel = !this.#showDetailsPanel;
                                    this.forceUpdate();
                                }}
							></TimelineComponent>
							<GlobalStatsComponent
								ref={(el) => (this.#globalStatsComponent = el)}
								globalStats={this.#jobStorage.getGlobalStats()}
							></GlobalStatsComponent>
						</div>
					</div>
					<div
						className={`col-12 col-md-6 binaryTreeHalf d-flex align-items-center justify-content-center ${
							!this.#showDetailsPanel ? 'hiddenPanel' : ''
						}`}
					>
						<div className='halfContainer d-flex flex-column align-items-center'>
							<DetailsComponent
								ref={(el) => (this.#detailsComponent = el)}
								context={this.#context}
								jobStorage={this.#jobStorage}
							></DetailsComponent>
							<div className='binaryTreeCanvasContainer'>
								<div
									className='binaryTreeCanvas'
									ref={(el) => (this.#binaryTreeRef = el)}
								></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
