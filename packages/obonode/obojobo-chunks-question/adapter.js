import Common from 'obojobo-document-engine/src/scripts/common'

const { OboModel } = Common.models

const Adapter = {
	construct(model) {
		model.setStateProp('type', 'default', p => p.toLowerCase(), ['default', 'survey'])
		model.setStateProp('solution', null, p => OboModel.create(p))
	},

	clone(model, clone) {
		clone.modelState.type = model.modelState.type
		clone.modelState.solution = null

		if (model.modelState.solution) {
			clone.modelState.solution = Object.assign({}, model.modelState.solution)
		}
	},

	toJSON(model, json) {
		json.content.type = model.modelState.type
		json.content.solution = null

		if (model.modelState.solution) {
			json.content.solution = model.modelState.solution.toJSON()
		}
	}
}

export default Adapter
