import React from 'react'
import Button from '../../../src/scripts/common/components/button'
import renderer from 'react-test-renderer'

test('Button', () => {
	const component = renderer.create(<Button className="testClassName">Label</Button>)
	const tree = component.toJSON()

	expect(tree).toMatchSnapshot()
})

test('Button dangerous', () => {
	const component = renderer.create(<Button isDangerous>Label</Button>)
	const tree = component.toJSON()

	expect(tree).toMatchSnapshot()
})

test('Button altAction', () => {
	const component = renderer.create(<Button altAction>Label</Button>)
	const tree = component.toJSON()

	expect(tree).toMatchSnapshot()
})

test('Button align', () => {
	const component = renderer.create(<Button align="left">Label</Button>)
	const tree = component.toJSON()

	expect(tree).toMatchSnapshot()
})

test('Button shouldPreventTab', () => {
	const component = renderer.create(<Button shouldPreventTab={true}>Label</Button>)
	const tree = component.toJSON()

	expect(tree).toMatchSnapshot()
})

test('Button disabled', () => {
	const component = renderer.create(<Button disabled={true}>Label</Button>)
	const tree = component.toJSON()

	expect(tree).toMatchSnapshot()
})
