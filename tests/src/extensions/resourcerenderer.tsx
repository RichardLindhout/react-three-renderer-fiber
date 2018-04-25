import dirtyChai = require("dirty-chai");
import * as React from "react";
import * as sinon from "sinon";
import {BoxGeometry} from "three";
import {IPropsWithChildren} from "../../../src/core/renderer/hostDescriptors/common/IPropsWithChildren";
import ResourceContainer from "../../../src/extensions/resources/ResourcesContainer";
import ResourceRenderer from "../../../src/extensions/resources/ResourcesRenderer";
import {mockConsole} from "../index";

const resourceRenderer = new ResourceRenderer();
// export default new ReactThreeRenderer(r3rReconcilerConfig);

chai.use(dirtyChai);

// noinspection TsLint
export interface IResourcesProps extends IPropsWithChildren {

}

describe("ResourceRenderer", () => {
  it("returns a ResourceContainer", (done) => {
    const container = {};

    const resourcesRef = sinon.spy();

    const resourceContainer = resourceRenderer.render(<resources ref={resourcesRef}/>, container);

    chai.expect(resourceContainer).to.be.instanceOf(ResourceContainer);
    chai.expect(resourceContainer).to.equal(resourcesRef.lastCall.args[0]);

    resourceRenderer.unmountComponentAtNode(container, () => {
      done();
    });
  });

  it("can render resources", (done) => {
    const container = {};

    const resourcesRef = sinon.spy();
    const geometryRef = sinon.spy();

    const resourceContainer = resourceRenderer.render(<resources ref={resourcesRef}>
      <boxGeometry
        resource-id="hey"
        width={20}
        height={20}
        depth={20}
        ref={geometryRef}/>
    </resources>, container);

    const geometry = geometryRef.lastCall.args[0];

    chai.expect(geometry).not.to.be.null();

    if (geometry == null) {
      return;
    }

    chai.expect(geometry).to.be.instanceOf(BoxGeometry);
    chai.expect(resourceContainer).to.equal(resourcesRef.lastCall.args[0]);
    chai.expect(ResourceContainer.Get(geometry)).to.equal(resourcesRef.lastCall.args[0]);
    chai.expect(resourceContainer.get("hey")).to.equal(geometry);

    resourceRenderer.unmountComponentAtNode(container, () => {
      chai.expect(geometryRef.lastCall.args[0]).to.be.null();
      done();
    });
  });

  it("should complain if multiple resources use same key", (done) => {
    const container = {};

    resourceRenderer.render(<resources>
      <boxGeometry
        resource-id="hey"
        width={20}
        height={20}
        depth={20}/>
      <meshBasicMaterial
        resource-id="hey"
      />
    </resources>, container);

    // remove the geometry

    resourceRenderer.render(<resources/>, container);

    mockConsole.expectError("Two resources seem to have the same id, one geometry and another geometry.");

    // chai.expect(resourceContainer).to.equal(resourcesRef.lastCall.args[0]);
    // chai.expect(GetResourceContainer(geometry)).to.equal(resourcesRef.lastCall.args[0]);
    // chai.expect(resourceContainer.get("hey")).to.equal(geometry);

    resourceRenderer.unmountComponentAtNode(container, () => {
      // chai.expect(geometryRef.lastCall.args[0]).to.be.null();
      done();
    });
  });

  it("can unmount resources", (done) => {
    const container = {};

    const geometryRef = sinon.spy();

    const resourceContainer: ResourceContainer = resourceRenderer.render(<resources>
      <boxGeometry
        resource-id="hey"
        width={20}
        height={20}
        depth={20}
        ref={geometryRef}/>
    </resources>, container);

    // remove the geometry

    resourceRenderer.render(<resources/>, container);

    chai.expect(geometryRef.callCount).to.equal(2);
    chai.expect(geometryRef.lastCall.args[0]).to.be.null();
    chai.expect(resourceContainer.get("hey")).to.be.undefined();

    // chai.expect(resourceContainer).to.equal(resourcesRef.lastCall.args[0]);
    // chai.expect(GetResourceContainer(geometry)).to.equal(resourcesRef.lastCall.args[0]);
    // chai.expect(resourceContainer.get("hey")).to.equal(geometry);

    resourceRenderer.unmountComponentAtNode(container, () => {
      // chai.expect(geometryRef.lastCall.args[0]).to.be.null();
      done();
    });
  });
});
