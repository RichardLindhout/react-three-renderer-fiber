import {expect} from "chai";
import * as React from "react";
import * as Sinon from "sinon";
import {
  BoxGeometry,
  Camera, Group,
  Mesh,
  MeshLambertMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import ReactThreeRenderer from "../../../src/core/renderer/reactThreeRenderer";

import {mockConsole} from "../index";

describe("render", () => {
  function verifyRenderCall(rendererSpy: Sinon.SinonSpy) {
    expect(rendererSpy.callCount).to.equal(1);

    const lastCall = rendererSpy.lastCall;

    const scene = lastCall.args[0] as Scene;

    expect(scene).to.be.instanceOf(Scene);
    expect(lastCall.args[1]).to.be.instanceOf(Camera);

    expect(scene.children.length).to.equal(1);

    const mesh = scene.children[0] as Mesh;

    expect(mesh).to.be.instanceOf(Mesh);

    expect(mesh.geometry).to.be.instanceOf(BoxGeometry);
    expect(mesh.material).to.be.instanceOf(MeshLambertMaterial);
  }

  it("should be able to be rendered into a renderer", (done) => {
    mockConsole.expectLog("THREE.WebGLRenderer", "87");
    mockConsole.expectWarn("THREE.WebGLProgram: gl.getProgramInfoLog()", "\n\n\n");

    const renderer = new WebGLRenderer();

    const renderCallSpy = Sinon.spy(renderer, "render");

    ReactThreeRenderer.render(<render
      camera={<perspectiveCamera name="perspective-camera" />}
      scene={<scene>
        <mesh>
          <boxGeometry width={5} height={5} depth={5} />
          <meshLambertMaterial />
        </mesh>
      </scene>} />, renderer);

    verifyRenderCall(renderCallSpy);

    ReactThreeRenderer.unmountComponentAtNode(renderer, () => {
      done();
    });
  });

  it("should be able to be rendered into a container within a renderer", (done) => {
    const container = document.createElement("canvas");

    const rendererSpy = Sinon.spy();

    ReactThreeRenderer.render(<webGLRenderer
      width={800}
      height={600}

      ref={rendererSpy}
    />, container);

    expect(rendererSpy.callCount).to.equal(1);

    const renderer = rendererSpy.lastCall.args[0];

    expect(renderer).to.be.instanceOf(WebGLRenderer);

    const renderCallSpy = Sinon.spy(rendererSpy.lastCall.args[0], "render");

    expect(renderCallSpy.notCalled).to.equal(true);

    ReactThreeRenderer.render(<webGLRenderer
      width={800}
      height={600}

      ref={rendererSpy}
    >
      <render
        camera={<perspectiveCamera name="perspective-camera" />}
        scene={<scene>
          <mesh>
            <boxGeometry width={5} height={5} depth={5} />
            <meshLambertMaterial />
          </mesh>
        </scene>} />
    </webGLRenderer>, container);

    verifyRenderCall(renderCallSpy);

    done();
  });

  it("should call the camera and scene refs with the correct objects", (done) => {
    const container = document.createElement("canvas");

    const perspectiveCameraRef = Sinon.spy();
    const sceneRef = Sinon.spy();

    ReactThreeRenderer.render(<webGLRenderer
      width={800}
      height={600}
    >
      <render
        camera={<perspectiveCamera ref={perspectiveCameraRef} name="some camera" />}
        scene={<scene ref={sceneRef} name="some scene">
          <mesh>
            <boxGeometry width={5} height={5} depth={5} />
            <meshLambertMaterial />
          </mesh>
        </scene>} />
    </webGLRenderer>, container);

    expect(perspectiveCameraRef.callCount).to.equal(1);
    expect(sceneRef.callCount).to.equal(1);

    const firstCamera: Camera = perspectiveCameraRef.lastCall.args[0];
    const firstScene: Scene = sceneRef.lastCall.args[0];

    expect(firstCamera.name).to.equal("some camera");
    expect(firstScene.name).to.equal("some scene");

    // they should have mounted into the same group
    const renderActionGroup: Group = firstScene.parent;

    expect(renderActionGroup).to.not.equal(null);
    expect(renderActionGroup).to.equal(firstCamera.parent);

    ReactThreeRenderer.render(<webGLRenderer
      width={800}
      height={600}
    >
      <render
        camera={<perspectiveCamera ref={perspectiveCameraRef} name="same camera different name" />}
        scene={<scene ref={sceneRef} name="same scene different name">
          <mesh>
            <boxGeometry width={5} height={5} depth={5} />
            <meshLambertMaterial />
          </mesh>
        </scene>} />
    </webGLRenderer>, container);

    // the refs should not be called again
    expect(perspectiveCameraRef.callCount).to.equal(1);
    expect(sceneRef.callCount).to.equal(1);

    expect(firstCamera.parent).to.equal(renderActionGroup);
    expect(firstScene.parent).to.equal(renderActionGroup);

    expect(firstCamera.name).to.equal("same camera different name");
    expect(firstScene.name).to.equal("same scene different name");

    ReactThreeRenderer.render(<webGLRenderer
      width={800}
      height={600}
    >
      <render
        camera={<perspectiveCamera ref={perspectiveCameraRef} name="another camera" key={"3"} />}
        scene={<scene ref={sceneRef} name="another scene" key={"4"}>
          <mesh>
            <boxGeometry width={5} height={5} depth={5} />
            <meshLambertMaterial />
          </mesh>
        </scene>} />
    </webGLRenderer>, container);

    // but for different keys, they should be!
    expect(perspectiveCameraRef.callCount).to.equal(3);
    expect(sceneRef.callCount).to.equal(3);

    // names should not have changed but they should have dismounted
    expect(firstCamera.name).to.equal("same camera different name");
    expect(firstScene.name).to.equal("same scene different name");

    expect(firstCamera.parent).to.equal(null);
    expect(firstScene.parent).to.equal(null);

    const secondCamera = perspectiveCameraRef.lastCall.args[0];
    const secondScene = sceneRef.lastCall.args[0];

    expect(secondCamera).to.not.equal(firstCamera);
    expect(secondScene).to.not.equal(firstScene);

    // they should have replaced the first camera and scene in the same group
    expect(secondCamera.parent).to.equal(renderActionGroup);
    expect(secondScene.parent).to.equal(renderActionGroup);

    expect(secondCamera.name).to.equal("another camera");
    expect(secondScene.name).to.equal("another scene");

    ReactThreeRenderer.render(<webGLRenderer
      width={800}
      height={600}
    >
      <render
        camera={<perspectiveCamera name="second camera but without ref this time" key={"3"} />}
        scene={<scene name="second scene but without ref this time" key={"4"}>
          <mesh>
            <boxGeometry width={5} height={5} depth={5} />
            <meshLambertMaterial />
          </mesh>
        </scene>} />
    </webGLRenderer>, container);

    expect(perspectiveCameraRef.callCount).to.equal(4);
    expect(sceneRef.callCount).to.equal(4);

    expect(perspectiveCameraRef.lastCall.args[0]).to.equal(null);
    expect(sceneRef.lastCall.args[0]).to.equal(null);

    expect(firstCamera.name).to.equal("same camera different name");
    expect(firstScene.name).to.equal("same scene different name");

    // sure the ref may not be called but it's still the same object
    expect(secondCamera.name).to.equal("second camera but without ref this time");
    expect(secondScene.name).to.equal("second scene but without ref this time");

    // and should remain in group
    expect(secondCamera.parent).to.equal(renderActionGroup);
    expect(secondScene.parent).to.equal(renderActionGroup);

    ReactThreeRenderer.render(<webGLRenderer
      width={800}
      height={600}
    >
      <render
        camera={<perspectiveCamera name="third camera" key={"10"} />}
        scene={<scene name="third scene" key={"20"}>
          <mesh>
            <boxGeometry width={5} height={5} depth={5} />
            <meshLambertMaterial />
          </mesh>
        </scene>} />
    </webGLRenderer>, container);

    expect(perspectiveCameraRef.callCount).to.equal(4);
    expect(sceneRef.callCount).to.equal(4);

    expect(perspectiveCameraRef.lastCall.args[0]).to.equal(null);
    expect(sceneRef.lastCall.args[0]).to.equal(null);

    expect(firstCamera.name).to.equal("same camera different name");
    expect(firstScene.name).to.equal("same scene different name");

    // second one should have dismounted, but the third one will be created
    expect(secondCamera.name).to.equal("second camera but without ref this time");
    expect(secondScene.name).to.equal("second scene but without ref this time");

    expect(secondCamera.parent).to.equal(null);
    expect(secondScene.parent).to.equal(null);

    const thirdCamera = renderActionGroup.children.filter((child) => child instanceof Camera)[0];
    const thirdScene = renderActionGroup.children.filter((child) => child instanceof Scene)[0];

    expect(thirdCamera.name).to.equal("third camera");
    expect(thirdScene.name).to.equal("third scene");

    done();
  });

  it("should accept a scene as a parameter", (done) => {
    const scene = new Scene();

    ReactThreeRenderer.render(<render
      camera={null}
      scene={scene}>

    </render>, document.body);

    done();
  });

  it("should accept a scene element as a parameter", (done) => {
    done();
  });

  it("should accept a camera as a parameter", (done) => {
    const camera = new PerspectiveCamera();

    ReactThreeRenderer.render(<render
      camera={camera}
      scene={null}>

    </render>, document.body);

    done();
  });

  it("should accept a camera element as a parameter", (done) => {
    done();
  });

  it("should trigger a render when a visible element is added", (done) => {
    done();
  });

  it("should trigger a render when a visible element is updated", (done) => {
    done();
  });

  it("should not trigger a render when an invisible element is added", (done) => {
    done();
  });

  it("should not trigger a render when am invisible element is updated", (done) => {
    done();
  });
});
