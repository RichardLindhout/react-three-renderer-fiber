import * as THREE from "three";
import {PointLight, PointLightShadow} from "three";
import isNonProduction from "../../../../../customRenderer/utils/isNonProduction";
import {IThreeElementPropsBase} from "../../../common/IReactThreeRendererElement";
import {default as LightDescriptorBase, ILightProps} from "../../../common/lightBase";
import {IRenderableProp, RefWrapper, SimplePropertyWrapper} from "../../../common/RefWrapper";
import {IPointLightShadowProps} from "./shadows/pointLightShadow";

export interface IPointLightProps extends ILightProps {
  distance?: number;
  decay?: number;
  power?: number;
  shadow?: IRenderableProp<PointLightShadow, IPointLightShadowProps>;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      pointLight: IThreeElementPropsBase<PointLight> & IPointLightProps;
    }
  }
}

class PointLightDescriptor extends LightDescriptorBase<IPointLightProps, PointLight> {
  constructor() {
    super();

    // TODO test pointLightShadow gets applied
    new RefWrapper(["shadow"], this)
      .wrapProperty(new SimplePropertyWrapper("shadow", [PointLightShadow]));

    this.hasSimpleProp("distance", false);
    this.hasSimpleProp("decay", false);

    this.removeProp("intensity");
    this.hasPropGroup(["intensity", "power"], this.updateIntensityAndPower);
  }

  public createInstance(props: IPointLightProps) {
    return new THREE.PointLight(props.color, props.intensity, props.distance, props.decay);
  }

  private updateIntensityAndPower = (instance: PointLight, newValue: {
    intensity?: number;
    power?: number;
  }) => {
    if ((newValue.power != null)) {
      if (isNonProduction) {
        if ((newValue.intensity != null)) {
          console.warn("A light has both `intensity` and `power` parameters.\n" +
            "This is not allowed, only the `power` parameter will be used.");
        }
      }

      instance.power = newValue.power;
    } else {
      if ((newValue.intensity != null)) {
        instance.intensity = newValue.intensity;
      } else {
        // both null...
        // reset to default?

        instance.intensity = 1;
      }
    }
  }
}

export default PointLightDescriptor;
