import React from 'react'
import renderer from 'react-test-renderer'
import { mount } from 'enzyme'

import AttemptIncompleteDialog from './attempt-incomplete-dialog'
import ModalUtil from 'obojobo-document-engine/src/scripts/common/util/modal-util'

jest.mock('obojobo-document-engine/src/scripts/common/util/modal-util', () => {
	return {
		hide: jest.fn()
	}
})

describe('AttemptIncompleteDialog', () => {
	beforeEach(() => {
		jest.resetAllMocks()
	})

	test('AttemptIncompleteDialog component', () => {
		const onSubmit = jest.fn()
		const component = renderer.create(<AttemptIncompleteDialog onSubmit={onSubmit} />)
		const tree = component.toJSON()

		expect(tree).toMatchSnapshot()
	})

	test('AttemptIncompleteDialog component cancels', () => {
		const onSubmit = jest.fn()
		const component = mount(<AttemptIncompleteDialog onSubmit={onSubmit} />)

		expect(ModalUtil.hide).not.toHaveBeenCalled()
		expect(onSubmit).not.toHaveBeenCalled()

		component
			.find('button')
			.at(1)
			.simulate('click')

		expect(ModalUtil.hide).toHaveBeenCalled()
		expect(onSubmit).not.toHaveBeenCalled()
	})

	test('AttemptIncompleteDialog component submits', () => {
		const onSubmit = jest.fn()
		const component = mount(<AttemptIncompleteDialog onSubmit={onSubmit} />)

		expect(ModalUtil.hide).not.toHaveBeenCalled()
		expect(onSubmit).not.toHaveBeenCalled()

		component
			.find('button')
			.at(0)
			.simulate('click')

		expect(ModalUtil.hide).toHaveBeenCalled()
		expect(onSubmit).toHaveBeenCalled()
	})
})
