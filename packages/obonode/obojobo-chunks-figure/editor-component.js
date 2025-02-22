import './viewer-component.scss'
import './editor-component.scss'

import { ReactEditor } from 'slate-react'
import { Editor, Transforms } from 'slate'

import Common from 'obojobo-document-engine/src/scripts/common'
import EditorStore from 'obojobo-document-engine/src/scripts/oboeditor/stores/editor-store'
import Node from 'obojobo-document-engine/src/scripts/oboeditor/components/node/editor-component'
import withSlateWrapper from 'obojobo-document-engine/src/scripts/oboeditor/components/node/with-slate-wrapper'
import Image from './image'
import ImageProperties from './image-properties-modal'
import React from 'react'
import isOrNot from 'obojobo-document-engine/src/scripts/common/util/isornot'
import {
	freezeEditor,
	unfreezeEditor
} from 'obojobo-document-engine/src/scripts/oboeditor/util/freeze-unfreeze-editor'
import ImageCaptionWidthTypes from './image-caption-width-types'
import { uploadFileViaImageNode } from './utils'

const { ModalUtil } = Common.util
const { Button } = Common.components

/**
 * Display an Obojobo Figure node.  Users can type below the figure to add a caption.
 * When the node is selected, the figure is outlined, and a delete button and image properties
 * button appear.  The Image properties button opens up a modal that alows the user to
 * select an image, and set its size and alt text. Clicking on the image when it is not selected
 * will move the cursor to the start of the figurecaption
 */
class Figure extends React.Component {
	constructor(props) {
		super(props)

		this.state = { draggingOver: false, url: '', errorMessage: '' }

		this.onImageDrop = this.onImageDrop.bind(this)
		this.onDragImageOver = this.onDragImageOver.bind(this)
		this.onDragImageLeave = this.onDragImageLeave.bind(this)
		this.updateImageSlateNode = this.updateImageSlateNode.bind(this)
		this.getCorrectImageContent = this.getCorrectImageContent.bind(this)
		this.focusFigure = this.focusFigure.bind(this)
		this.deleteNode = this.deleteNode.bind(this)
		this.showImagePropertiesModal = this.showImagePropertiesModal.bind(this)
		this.changeProperties = this.changeProperties.bind(this)
		this.returnFocusOnTab = this.returnFocusOnTab.bind(this)
		this.returnFocusOnShiftTab = this.returnFocusOnShiftTab.bind(this)
		this.onCloseImagePropertiesModal = this.onCloseImagePropertiesModal.bind(this)
	}

	focusFigure() {
		if (!this.props.selected) {
			const path = ReactEditor.findPath(this.props.editor, this.props.element)
			const start = Editor.start(this.props.editor, path)
			Transforms.setSelection(this.props.editor, {
				focus: start,
				anchor: start
			})
		}
	}

	deleteNode() {
		const path = ReactEditor.findPath(this.props.editor, this.props.element)
		Transforms.removeNodes(this.props.editor, { at: path })
	}

	showImagePropertiesModal() {
		freezeEditor(this.props.editor)
		const content = this.getCorrectImageContent()

		ModalUtil.show(
			<ImageProperties
				allowedUploadTypes={EditorStore.state.settings.allowedUploadTypes}
				content={content}
				onConfirm={this.changeProperties}
				onCancel={this.onCloseImagePropertiesModal}
			/>
		)
	}

	onCloseImagePropertiesModal() {
		ModalUtil.hide()
		unfreezeEditor(this.props.editor)
	}

	returnFocusOnTab(event) {
		if (event.key === 'Tab' && !event.shiftKey) {
			event.preventDefault()
			return ReactEditor.focus(this.props.editor)
		}
	}

	returnFocusOnShiftTab(event) {
		if (event.key === 'Tab' && event.shiftKey) {
			event.preventDefault()
			return ReactEditor.focus(this.props.editor)
		}
	}

	changeProperties(content) {
		this.onCloseImagePropertiesModal()
		this.updateImageSlateNode(content)
	}

	updateImageSlateNode(content) {
		const path = ReactEditor.findPath(this.props.editor, this.props.element)
		Transforms.setNodes(
			this.props.editor,
			{ content: { ...this.props.element.content, ...content } },
			{ at: path }
		)
	}

	getCorrectImageContent() {
		if (this.state.url) {
			// Image added by dragging and dropping
			return { url: this.state.url, width: null, height: null, size: 'small' }
		} else {
			// Image added with the modal
			return this.props.element.content
		}
	}

	onDragImageOver(e) {
		e.preventDefault()

		this.setState({ draggingOver: true })
	}

	onImageDrop(e) {
		this.setState({ errorMessage: '' })
		if (e.dataTransfer && e.dataTransfer.items && e.dataTransfer.items.length > 0) {
			const item = e.dataTransfer.items[0]
			if (item.kind === 'file') {
				const file = item.getAsFile()

				uploadFileViaImageNode(file).then(mediaData => {
					if (mediaData && mediaData.status === 'error') {
						this.setState({ errorMessage: mediaData.value.message })
						return
					}

					const content = { url: mediaData.media_id }
					this.setState({ url: content.url })
					this.updateImageSlateNode(content)
				})
			}
		}

		this.setState({ draggingOver: false })
	}

	onDragImageLeave() {
		this.setState({ draggingOver: false })
	}

	render() {
		const content = this.getCorrectImageContent()
		const hasAltText = content.alt && content.alt.length !== 0
		const selected = this.props.selected
		const isSelected = isOrNot(selected, 'selected')
		const draggingOver = this.state.draggingOver ? 'drag-over' : ''
		const captionWidth = content.captionWidth || ImageCaptionWidthTypes.IMAGE_WIDTH

		const customStyle = {}
		const captionStyle = {}
		if (content.size === 'custom') {
			if (content.width) {
				customStyle.width = content.width + 'px'

				if (captionWidth === ImageCaptionWidthTypes.IMAGE_WIDTH) {
					captionStyle.width = content.width + 'px'
				}
			}

			customStyle['maxWidth'] = '100%'
		}

		return (
			<Node {...this.props}>
				<div className={`obojobo-draft--chunks--figure viewer ${content.size} ${isSelected}`}>
					{hasAltText ? null : (
						<div
							contentEditable={false}
							className="accessibility-warning"
							style={{ userSelect: 'none' }}
						>
							Accessibility Warning: No Alt Text!
						</div>
					)}
					<figure className="container">
						<div
							className={`figure-box  ${isSelected}  ${draggingOver}`}
							style={customStyle}
							contentEditable={false}
							onClick={this.focusFigure}
							onDrop={this.onImageDrop}
							onDragLeave={this.onDragImageLeave}
							onDragOver={this.onDragImageOver}
						>
							<Button
								className="delete-button"
								onClick={this.deleteNode}
								onKeyDown={this.returnFocusOnShiftTab}
								tabIndex={selected ? '0' : '-1'}
							>
								×
							</Button>
							<div className="image-toolbar">
								<Button
									className="properties-button"
									onClick={this.showImagePropertiesModal}
									onKeyDown={this.returnFocusOnTab}
									tabIndex={selected ? '0' : '-1'}
								>
									Image Properties
								</Button>
							</div>
							<p className="error-message">{this.state.errorMessage}</p>
							<Image
								style={customStyle}
								key={content.url + content.width + content.height + content.size}
								chunk={{ modelState: content }}
								lazyLoad={false}
							/>
						</div>
						<figcaption
							className={`align-center is-caption-width-${captionWidth}`}
							style={captionStyle}
						>
							{this.props.children}
						</figcaption>
					</figure>
				</div>
			</Node>
		)
	}
}

export default withSlateWrapper(Figure)
