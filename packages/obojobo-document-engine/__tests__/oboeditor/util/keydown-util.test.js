import KeyDownUtil from 'src/scripts/oboeditor/util/keydown-util'

describe('KeyDown Util', () => {
	test('deleteNodeContents deals with selection collapsed at start of block', () => {
		const editor = {
			value: {
				selection: {
					start: { offset: 0 },
					isCollapsed: true
				},
				blocks: [{ key: 'mockKey' }]
			}
		}

		const event = {
			preventDefault: jest.fn()
		}

		KeyDownUtil.deleteNodeContents(event, editor, jest.fn())
		expect(event.preventDefault).toHaveBeenCalled()
	})

	test('deleteNodeContents deals with selection inside cell', () => {
		const editor = {
			value: {
				selection: {
					start: { offset: 0 },
					isCollapsed: false
				},
				blocks: [{ key: 'mockKey' }]
			}
		}

		const event = {
			preventDefault: jest.fn()
		}

		KeyDownUtil.deleteNodeContents(event, editor, jest.fn())

		expect(event.preventDefault).not.toHaveBeenCalled()
	})

	test('deleteNodeContents deals with selection across cells without first cell', () => {
		const editor = {
			value: {
				startBlock: {
					key: 'mockStart'
				},
				endBlock: {
					key: 'mockEnd'
				},
				blocks: {
					some: () => true,
					toSet: () => ({
						first: () => false,
						last: () => true,
						rest: () => [{ nodes: [{ key: 'mock keyTwo' }] }],
						butLast: () => [{ nodes: [{ key: 'mock keyOne' }] }]
					})
				},
				selection: {
					start: { offset: 0 },
					isCollapsed: false,
					moveToStart: () => ({
						start: {
							isAtEndOfNode: value => value
						}
					}),
					moveToEnd: () => ({
						end: {
							isAtStartOfNode: value => value
						}
					})
				}
			}
		}
		editor.removeNodeByKey = jest.fn()

		const event = {
			preventDefault: jest.fn()
		}

		KeyDownUtil.deleteNodeContents(event, editor, jest.fn())

		expect(event.preventDefault).toHaveBeenCalled()
		expect(editor.removeNodeByKey).toHaveBeenCalled()
	})

	test('deleteNodeContents deals with selection across cells without last cell', () => {
		const editor = {
			value: {
				startBlock: {
					key: 'mockStart'
				},
				endBlock: {
					key: 'mockEnd'
				},
				blocks: {
					some: () => true,
					toSet: () => ({
						first: () => true,
						last: () => false,
						rest: () => [{ nodes: [{ key: 'mock keyTwo' }] }],
						butLast: () => [{ nodes: [{ key: 'mock keyOne' }] }]
					})
				},
				selection: {
					start: { offset: 0 },
					isCollapsed: false,
					moveToStart: () => ({
						start: {
							isAtEndOfNode: value => value
						}
					}),
					moveToEnd: () => ({
						end: {
							isAtStartOfNode: value => value
						}
					})
				}
			}
		}
		editor.removeNodeByKey = jest.fn()

		const event = {
			preventDefault: jest.fn()
		}

		KeyDownUtil.deleteNodeContents(event, editor, jest.fn())

		expect(event.preventDefault).toHaveBeenCalled()
		expect(editor.removeNodeByKey).toHaveBeenCalled()
	})
})
