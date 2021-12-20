import { Attribute, LABEL, VALUE }                          from "../presentationModel/presentationModel.js";
//import { listItemProjector, formProjector, pageCss }        from "./instantUpdateProjector.js";
import { listItemProjector, formProjector, pageCss }        from "./tableProjector.js";

export { MasterView, DetailView, Person, NoPerson, ALL_ATTRIBUTE_NAMES }

// page-style change, only executed once
const style = document.createElement("STYLE");
style.innerHTML = pageCss;
document.head.appendChild(style);

const ALL_ATTRIBUTE_NAMES = ['firstname', 'lastname'];

const Person = () => {                               // facade
    const firstnameAttr = Attribute("Monika");
    firstnameAttr.getObs(LABEL).setValue("First Name");

    const lastnameAttr  = Attribute("Mustermann");
    lastnameAttr.getObs(LABEL).setValue("Last Name");

    // 1) commented out since we do not use this at the moment
    // 2) un-comment in case you need some converters or validators
    // lastnameAttr.setConverter( input => input.toUpperCase() );
    // lastnameAttr.setValidator( input => input.length >= 3   );

    return {
        firstname:          firstnameAttr,
        lastname:           lastnameAttr,
    }
};

// View-specific parts

const MasterView = (listController, selectionController, rootElement) => {

    const render = person =>
        listItemProjector(listController, selectionController, rootElement, person, ALL_ATTRIBUTE_NAMES);

    // binding
    listController.onModelAdd(render);
};

const NoPerson = (() => { // one time creation, singleton
    const johnDoe = Person();
    johnDoe.firstname.setConvertedValue("");
    johnDoe.lastname.setConvertedValue("");
    return johnDoe;
})();

const detailModel = Person();

const DetailView = (listController, selectionController, rootElement) => {
    let lastSelectedPerson = NoPerson;
    // static binding of the detail view against the detailModel
    formProjector(selectionController, rootElement, detailModel, ALL_ATTRIBUTE_NAMES);

    // when the detail model changes, any selected model needs value updates
    // this binding is only done once since the update target changes as needed
    ALL_ATTRIBUTE_NAMES.forEach(attributeName => {
        detailModel[attributeName].getObs(VALUE).onChange( value => {
            if (lastSelectedPerson !== NoPerson) {
                lastSelectedPerson[attributeName].getObs(VALUE).setValue(value);
            }
        });
    });
    // changes in the master view need to be reflected in the detail view, therefore
    // each model needs a listener that updates the detail model.
    // This is only ever done once per model.
    listController.onModelAdd( model => {
        ALL_ATTRIBUTE_NAMES.forEach(attributeName => {
            model[attributeName].getObs(VALUE).onChange( value => {
                if (lastSelectedPerson === model) {
                    detailModel[attributeName].getObs(VALUE).setValue(value);
                }
            });
        });
    });

    // when the selection changes, the detail model values need to be updated
    // but no change to the binding (!) needs to happen
    selectionController.onModelSelected( selectedModel => {
        lastSelectedPerson = selectedModel;
        ALL_ATTRIBUTE_NAMES.forEach(attributeName => {
            detailModel[attributeName].getObs(VALUE).setValue(
                selectedModel[attributeName].getObs(VALUE).getValue()
            );
        })
    });
};
