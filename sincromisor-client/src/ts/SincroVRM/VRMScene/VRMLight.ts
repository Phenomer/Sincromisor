import { DirectionalLight } from "three/src/lights/DirectionalLight.js";
import { Vector3 } from "three/src/math/Vector3.js";

export class VRMLight {
    public readonly light: DirectionalLight;

    constructor() {
        this.light = new DirectionalLight(0xffffff, Math.PI);
        this.light.position.set(0.0, 1.0, 5.0).normalize();
    }

    setPotision(position: Vector3): void {
        this.light.position.copy(position);
    }

    setIntensity(intensity: number): void {
        this.light.intensity = intensity;
    }
}
