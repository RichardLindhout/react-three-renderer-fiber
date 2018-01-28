import {Color, Fog, IFog, Object3D, Scene, WebGLRenderer} from "three";
import {IThreeElementPropsBase} from "../../common/IReactThreeRendererElement";
import {default as Object3DDescriptorBase, IObject3DProps} from "../../common/object3DBase";
import {IElement} from "../../common/RefWrapper";

export type SceneParents = Object3D | WebGLRenderer;

export interface ISceneProps extends IObject3DProps {
  background?: Color;
  fog?: IFog;
}

export type SceneElementProps = IThreeElementPropsBase<Scene> & ISceneProps;

export type SceneElement = IElement<Scene, SceneElementProps>;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      scene: SceneElementProps;
    }
  }
}

class SceneDescriptor extends Object3DDescriptorBase<IObject3DProps, Scene, SceneParents> {
  constructor() {
    super();

    this.hasSimpleProp("background");
    this.hasSimpleProp("fog");
  }

  public createInstance(props: IObject3DProps) {
    return new Scene();
  }

  public willBeAddedToParent(instance: Scene, parentInstance: SceneParents): void {
    if (parentInstance instanceof WebGLRenderer) {
      // no-op
    } else {
      super.willBeAddedToParent(instance, parentInstance);
    }
  }
}

export default SceneDescriptor;
