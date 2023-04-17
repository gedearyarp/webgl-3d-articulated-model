import { projectionType, textureType, modelType } from '../config/constant.js';
import { mat4 } from './mat4.js';
import { PersonModel } from '../config/person.js';
import { ChickenModel } from '../config/chicken.js';

class Controller {
    constructor(modelGl, modelProgram, componentGl, componentProgram) {
        this.model = {
            gl: modelGl,
            program: modelProgram,
            object: PersonModel.getModel(),
            projection: projectionType.ORTHOGRAPHIC,
            texture: textureType.BUMP,
            cameraAngle: 0,
            cameraRadius: 300,
            useShading: true,
            animation: false,
        }

        this.component = {
            gl: componentGl,
            program: componentProgram,
            object: this.model.object.findComponentByName("body"),
            projection: projectionType.ORTHOGRAPHIC,
            texture: textureType.BUMP,
            cameraAngle: 0,
            cameraRadius: 300,
            useShading: true,
        }
    }

    setModel() {
        const controller = this;
        return {
            object: function (objectType) {
                if (objectType === modelType.PERSON) {
                    controller.model.object = PersonModel.getModel();
                } else if (objectType === modelType.CHICKEN) {
                    controller.model.object = ChickenModel.getModel();
                } else if (objectType === modelType.TABLE) {
                    controller.model.object = PersonModel.getModel(); // TODO: change to table model
                } else if (objectType === modelType.CAR) {
                    controller.model.object = PersonModel.getModel(); // TODO: change to car model
                }

                controller.component.object = controller.model.object;
            },

            projection: function (projectionType) {
                controller.model.projection = projectionType;
            },

            texture: function (textureType) {
                controller.model.texture = textureType;
            },

            cameraAngle: function (angle) {
                controller.model.cameraAngle = angle;
            },

            cameraRadius: function (radius) {
                controller.model.cameraRadius = radius;
            },

            useShading: function (useShading) {
                controller.model.useShading = useShading;
            },

            animation: function (animation) {
                controller.model.animation = animation;
            },

            translate: function (id, translate) {
                controller.model.object.dfsTranslate(id, parseFloat(translate));
            },

            rotate: function (id, rotate) {
                controller.model.object.dfsRotate(id, parseFloat(rotate));
            },

            scale: function (id, scale) {
                controller.model.object.dfsScale(id, parseFloat(scale));
            },
        }
    }

    setComponent() {
        const controller = this;
        return {
            object: function (name) {
                controller.component.object = controller.model.object.findComponentByName(name);
            },

            projection: function (projectionType) {
                controller.component.projection = projectionType;
            },

            texture: function (textureType) {
                controller.component.texture = textureType;
            },

            cameraAngle: function (angle) {
                controller.component.cameraAngle = angle;
            },

            cameraRadius: function (radius) {
                controller.component.cameraRadius = radius;
            },

            useShading: function (useShading) {
                controller.component.useShading = useShading;
            },

            translate: function (id, translate) {
                controller.component.object.object.translate[id] = parseFloat(translate);
            },

            rotate: function (id, rotate) {
                controller.component.object.object.rotate[id] = parseFloat(rotate);
            },

            scale: function (id, scale) {
                controller.component.object.object.scale[id] = parseFloat(scale);
            },
        }
    }

    render() {
        this.__renderModel();
        this.__renderComponent();

        requestAnimationFrame(this.render.bind(this));
    }

    __renderModel() {
        let gl = this.model.gl;
        let program = this.model.program;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);

        const projectionMat = this.__getProjectionMatrix(gl, this.model);
        const colorVec = [0.6, 0.2, 0.4];

        this.model.object.draw(
            gl, 
            program,
            projectionMat,
            colorVec,
            this.model.projection,
            this.model.useShading,
            this.model.texture,
        );
    }

    __renderComponent() {
        let gl = this.component.gl;
        let program = this.component.program;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);

        const projectionMat = this.__getProjectionMatrix(gl, this.component);
        const colorVec = [0.6, 0.2, 0.4];

        this.component.object.drawComponent(
            gl, 
            program, 
            projectionMat,
            colorVec,
            this.component.projection,
            this.component.useShading,
            this.component.texture,
        );
    }

    __getViewMatrix(object) {;
        const cameraPos = this.__getCameraPos(object);
        const viewMat = mat4.lookAt(cameraPos, [0, 0, 0], [0, 1, 0]);

        return mat4.inverse(viewMat);
    }

    __getCameraPos(object) {
        let cameraEye = mat4.identityMatrix();

        const cameraRotation = mat4.rotationMatrix(0, this.__degToRad(object.cameraAngle), 0);
        const cameraTranslate = mat4.translationMatrix(0, 0, object.cameraRadius / 1000);

        cameraEye = mat4.mult(cameraEye, cameraRotation);
        cameraEye = mat4.mult(cameraEye, cameraTranslate);

        return [cameraEye[12], cameraEye[13], cameraEye[14]];
    }

    __getProjectionMatrix(gl, object) {
        const degA = this.__degToRad(64);
        const degB = this.__degToRad(64);

        const left = -1;
        const right = 1;
        const bottom = -1;
        const top = 1;
        const near = -1;
        const far = 1;

        let projection;
        switch (object.projection) {
            case projectionType.ORTHOGRAPHIC:
                projection = mat4.orthographic(left, right, bottom, top, near, far);
                break;
            case projectionType.OBLIQUE:
                projection = mat4.oblique(degA, degB);
                break;
            case projectionType.PERSPECTIVE:
                projection = mat4.identityMatrix();
                break;
        }

        const cameraRotation = mat4.rotationMatrix(0, this.__degToRad(object.cameraAngle), 0);
        const cameraTranslation = mat4.translationMatrix(0, 0, object.cameraRadius / 1000);

        const cameraTransform = mat4.mult(cameraRotation, cameraTranslation);

        return mat4.mult(projection, cameraTransform);
    }

    __degToRad(deg) {
        return deg * Math.PI / 180;
    }
}

export { Controller };