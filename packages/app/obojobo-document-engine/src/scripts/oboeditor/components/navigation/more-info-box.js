import './more-info-box.scss'

import ClipboardUtil from '../../util/clipboard-util'
import Common from 'Common'
import React from 'react'

import MoreInfoIcon from '../../assets/more-info-icon'
import TriggerListModal from '../triggers/trigger-list-modal'

const { Button, Slider } = Common.components
const { ModalUtil } = Common.util

const { OboModel } = Common.models

// Expected Props:
// id: String - the id of the item to edit
// content: Object - the item data for the node.  Each key-value pair would be edited independantly
// saveId: Function(oldId, newId) - updates the id.  Returns a string error if the id couldn't save
// saveContent: Function(oldContent, newContent) - updates the content. Returns a string error if the content is invalid
// contentDescription: [Object] - a list of descriptions that tells which content attributes to display and how
// 			Each description should have a name, a description, and a type
class MoreInfoBox extends React.Component {
	constructor(props) {
		super(props)

		this.model = OboModel.models[this.props.id]

		// const startAttemptLock = hasTriggerTypeWithActionType(content.triggers, 'onNavEnter', 'nav:lock')
		// const endAttemptUnlock =
			// hasTriggerTypeWithActionType(content.triggers, 'onEndAttempt', 'nav:unlock') &&
			// hasTriggerTypeWithActionType(content.triggers, 'onNavExit', 'nav:unlock')

		this.state = {
			currentId: this.props.id,
			needsUpdate: false,
			error: null,
			isOpen: false,
			content: this.props.content,
		}

		this.handleClick = this.handleClick.bind(this)

		this.toggleOpen = this.toggleOpen.bind(this)
		this.close = this.close.bind(this)

		this.handleIdChange = this.handleIdChange.bind(this)
		this.onSave = this.onSave.bind(this)

		this.showTriggersModal = this.showTriggersModal.bind(this)
		this.closeModal = this.closeModal.bind(this)

		this.node = React.createRef()
	}

	componentDidMount() {
		document.addEventListener('mousedown', this.handleClick, false)
	}

	componentWillUnmount() {
		document.removeEventListener('mousedown', this.handleClick, false)
	}

	handleClick(event) {
		if (!this.node.current || this.node.current.contains(event.target)) return

		// When the click is outside the box, close the box
		if(this.state.needsUpdate) return this.onSave()

		this.close()
	}

	handleIdChange(event) {
		const currentId = event.target.value

		return this.setState({ currentId, needsUpdate: true })
	}

	handleContentChange(key, event) {
		const newContent = {}
		newContent[key] = event.target.value

		this.setState(prevState => ({
			content: Object.assign(prevState.content, newContent)
		}))
	}

	handleAbstractToggleChange(changeFn, booleanValue) {
		this.setState(prevState => ({ content: changeFn(prevState.content, booleanValue) }))
	}

	onSave() {
		const error = this.props.saveId(this.props.id, this.state.currentId) || this.props.saveContent(this.props.content, this.state.content)
		if(!error) {
			return this.close()
		}
		
		this.setState({ error })
	}

	toggleOpen() {
		if(this.state.isOpen) {
			this.onSave()
		} else {
			this.setState({ isOpen: true })
		}
	}

	close() {
		return this.setState({ isOpen: false })
	}

	showTriggersModal() {
		// Prevent info box from closing when modal is opened
		document.removeEventListener('mousedown', this.handleClick, false)
		ModalUtil.show(
			<TriggerListModal 
				content={this.state.content} 
				onClose={this.closeModal}/>
		)
	}

	closeModal(modalState) {
		this.setState(prevState => ({ content: { ...prevState.content, triggers: modalState.triggers}, needsUpdate: true }))
		document.addEventListener('mousedown', this.handleClick, false)
		ModalUtil.hide()
	}

	renderItem(description) {
		switch(description.type) {
			case 'input':
				return (
					<div>
						<label>{description.description}</label>
						<input
							type="text"
							value={this.state.content[description.name]}
							onChange={this.handleContentChange.bind(this, description.name)}/>
					</div>
				)
			case 'select':
				return (
					<div>
						<label>{description.description}</label>
						<select 
							className="select-item" 
							value={this.state.content[description.name]}
							onChange={this.handleContentChange.bind(this, description.name)}>
							{description.values.map(option => (
								<option value={option.value} key={option.value}>{option.description}</option>
							))}
						</select>
					</div>
				)
			case 'toggle':
				return (
					<div>
						<label>{description.description}</label>
						<input
							type="text"
							value={this.state.content[description.name]}
							onChange={this.handleContentChange}/>
					</div>
				)
			// Toggles complex things, like Lock Nav during Assessment Attempt
			case 'abstract-toggle':
				return (
					<Slider
						title={description.description}
						initialChecked={description.value(this.state.content)}
						handleCheckChange={this.handleAbstractToggleChange.bind(this, description.onChange)}/>
				)
		}
				
	}

	renderInfoBox() {
		const triggers = this.state.content.triggers
		return (
			<div className="more-info-box">
				<div className="container">
					<div className="properties">
						<div>
							{this.model.get('type')}
						</div>
						<div>
							<div>
								<label htmlFor="oboeditor--components--more-info-box--id-input">Id</label>
								<input
									type="text"
									id="oboeditor--components--more-info-box--id-input"
									value={this.state.currentId}
									onChange={this.handleIdChange}
									className="id-input"/>
								<Button 
									className="input-aligned-button"
									onClick={() => ClipboardUtil.copyToClipboard(this.state.currentId)}>
										Copy Id
								</Button>
							</div>
							{this.props.contentDescription.map(description => this.renderItem(description))}
						</div>
						<div>
							<span className="triggers">
								Triggers:
								{ triggers && triggers.length > 0 ?
									<span>
										{ triggers
												.map(trigger => trigger.type)
												.reduce((accum, trigger) => accum + ", " + trigger) }
									</span>
									: null }
							</span>
							<Button 
								className="trigger-button"
								onClick={this.showTriggersModal}>
								✎ Edit
							</Button>
						</div>
						<div>
							<Button 
								className="delete-page-button"
								onClick={this.showDeleteModal}>Delete</Button>
							<Button 
								className="duplicate-button"
								onClick={this.duplicatePage}>
								Duplicate
							</Button>
						</div>
					</div>
					<div>
						{this.state.error ? <p>{this.state.error}</p> : null }
						<Button 
							onClick={this.onSave}
							className="cancel-button">
							Close
						</Button>
					</div>
				</div>
			</div>
		)
	}

	render() {
		return (
			<div ref={this.node} className={'more-info ' + this.props.className}>
				<button 
					className={'more-info-button ' + ( this.state.isOpen ? 'is-open' : '')}
					onClick={this.toggleOpen}>
					<MoreInfoIcon />
				</button>
				{ this.state.isOpen ? this.renderInfoBox() : null }
			</div>
		)
	}
}

export default MoreInfoBox
