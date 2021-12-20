
import { ListController, SelectionController,  }    from './controller.js';
import { MasterView, DetailView, Person, NoPerson } from './person.js';
import { Suite }                                    from "../test/test.js";
import {_lastListenerCount}                         from "../observable/observable.js";

const personSuite = Suite("person");

personSuite.add("crud", assert => {

    // setup
    const masterContainer = document.createElement("div");
    const detailContainer = document.createElement("div");
    detailContainer.innerHTML = "<div>to replace</div>";

    const masterController    = ListController(Person);
    const selectionController = SelectionController(NoPerson);

    // create the sub-views, incl. binding

    MasterView(masterController, selectionController, masterContainer);
    DetailView(masterController, selectionController, detailContainer);

    const elementsPerRow = 1;

    assert.is(masterContainer.children.length, 0*elementsPerRow);

    masterController.addModel();

    assert.is(masterContainer.querySelectorAll("tr").length - 1 , 1*elementsPerRow);

    masterController.addModel();

    assert.is(masterContainer.querySelectorAll("tr").length - 1 , 2*elementsPerRow);

    const firstInput = masterContainer.querySelectorAll("input[type=text]")[0];
    const firstDeleteButton = masterContainer.querySelectorAll("button")[0];

    firstDeleteButton.click();

    assert.is(masterContainer.querySelectorAll("tr").length - 1 , 1*elementsPerRow);


});

personSuite.add("memleak", assert => {

    // setup
    const masterContainer = document.createElement("div");
    const detailContainer = document.createElement("div");
    detailContainer.innerHTML = "<div>to replace</div>";

    const masterController    = ListController(Person);
    const selectionController = SelectionController(NoPerson);

    // create the sub-views, incl. binding

    MasterView(masterController, selectionController, masterContainer);
    DetailView(masterController, selectionController, detailContainer);

    const elementsPerRow = 1;
    const inputsPerRow   = 3;

    // make two models such that we can switch between them
    const model1 = masterController.addModel();
    const model2 = masterController.addModel();

    const firstInput  = masterContainer.querySelectorAll("input[type=text]")[0];
    const secondInput = masterContainer.querySelectorAll("input[type=text]")[inputsPerRow];

    const oldListenerCount = _lastListenerCount;
    (1).times ( n => {
        selectionController.setSelectedModel(model1);
        selectionController.setSelectedModel(model2);
    });
    assert.is(_lastListenerCount, oldListenerCount);

});

personSuite.run();
