import { GlObject } from "./gl-object.js";

export class ArticulatedObject {
    constructor(name, vertices, indices) {
        this.name = name;
        this.child = [];
        this.object = new GlObject(name, vertices, indices);

        this.translate = [0, 0, 0];
        this.rotate = [0, 0, 0];
        this.scale = [1, 1, 1];
    }

    addChild(child) {
        this.child.push(child);
    }

    drawComponent(gl, program, projectionMat, colorVec, projType, useShading, textureType) {
        this.object.draw(
            gl, 
            program, 
            projectionMat,
            colorVec, 
            projType, 
            useShading, 
            textureType, 
            {
                translate: this.translate, 
                rotate: this.rotate, 
                scale: this.scale
            }
        );
    }

    draw(gl, program, projectionMat, colorVec, projType, useShading, textureType) {
        this.object.draw(
            gl, 
            program, 
            projectionMat,
            colorVec, 
            projType, 
            useShading, 
            textureType, 
            {
                translate: this.translate, 
                rotate: this.rotate, 
                scale: this.scale
            }
        );

        for (let i = 0; i < this.child.length; i++) {
            this.child[i].draw(gl, program, projectionMat, colorVec, projType, useShading, textureType);
        }
    }

    setTexture(gl, program, texture, textureType) {
        this.object.setTexture(gl, program, texture, textureType);
        for (let i = 0; i < this.child.length; i++) {
            this.child[i].setTexture(gl, program, texture, textureType);
        }
    }

    findComponentByName(name) {
        if (this.name === name) {
            return this;
        }

        for (let i = 0; i < this.child.length; i++) {
            const result = this.child[i].findComponentByName(name);
            if (result !== null) return result;
        }

        return null;
    }

    dfsTranslate(id, translation) {
        this.translate[id] = translation;
        for (let i = 0; i < this.child.length; i++) {
            this.child[i].dfsTranslate(id, translation);
        }
    }

    dfsRotate(id, rotation) {
        this.rotate[id] = rotation;
        for (let i = 0; i < this.child.length; i++) {
            this.child[i].dfsRotate(id, rotation);
        }
    }

    dfsScale(id, scale) {
        this.scale[id] = scale;
        for (let i = 0; i < this.child.length; i++) {
            this.child[i].dfsScale(id, scale);
        }
    }

    getComponentTreeDisplay() {
        let result = `<div class="d-flex flex-column" style="gap: 0.3rem">`;

        const nextRandomColor = this.__generateRandomColor();
        result += this.dfsComponentTreeDisplay(0, nextRandomColor);
        result += `</div>`;

        return result;
    }

    dfsComponentTreeDisplay(depth, color) {
        let result = `<div>`;

        const space = "&nbsp;".repeat(depth * 6);
        const kebabCaseName = this.__toKebabCase(this.name);
        const componentId = `component-part-${kebabCaseName}`;

        result += 
        `${space}
        <button 
            type="button" class="btn btn-primary" 
            id="${componentId}"
            style="background-color: ${color};"
        >
            ${this.name}
        </button>`;
        result += `</div>`;

        const nextRandomColor = this.__generateRandomColor();
        for (let i = 0; i < this.child.length; i++) {
            result += this.child[i].dfsComponentTreeDisplay(depth + 1, nextRandomColor);
        }

        return result;
    }

    __toKebabCase(str) {
        return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
    }

    __generateRandomColor() {
        const r = Math.floor(Math.random() * 128);
        const g = Math.floor(Math.random() * 128);
        const b = Math.floor(Math.random() * 128);

        return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
    }
}