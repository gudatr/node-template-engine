"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs/promises"));
class Templater {
    static setTemplateFolder(name) {
        this.templateFolder = name;
    }
    /**
     * This function will attempt to load the template, read it and then check if it was compiled previously by has comparison.
     * Otherwise it will compile and cache the template
     * @param templateName
     * @param data
     * @returns
     */
    static render(templateName, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let templateString = (yield fs.readFile(this.templateFolder + templateName)).toString();
            let hash = this.hash(templateString).toString();
            let cached = this.hashes[templateName];
            if (cached === undefined || cached.hash !== hash) {
                let chunks = this.parse(templateString);
                let fn = this.compile(chunks);
                cached = this.hashes[templateName] = new CachedTemplate(hash, fn);
            }
            return cached.fn(data);
        });
    }
    /**
     * This function will check for expressions matching {{.*?}} regex which can hold expressions
     *  and isolate them and the surrounding strings into a string array
     * @param templateString
     * @returns
     */
    static parse(templateString) {
        const chunks = [];
        while (true) {
            //Expand here with your custom tags
            let result = /{{(.*?)}}/g.exec(templateString);
            if (!result)
                break;
            if (result.index !== 0) {
                chunks.push(templateString.substring(0, result.index));
                templateString = templateString.slice(result.index);
            }
            chunks.push(result[0]);
            templateString = templateString.slice(result[0].length);
        }
        chunks.push(templateString);
        return chunks;
    }
    /**
     * The string array from the parsed function will be concat in a way that allows interpolation where the {{.*?}} matched
     * A function will be created from this that takes in a data argument with which data can be passed to the template
     * @param parsed
     * @returns
     */
    static compile(parsed) {
        let renderFunction = `""`;
        //Expand here with your custom tags
        parsed.map(t => {
            if (t.startsWith("{{") && t.endsWith("}}")) {
                renderFunction += `+${t.substring(2, t.length - 2)}`;
            }
            else {
                renderFunction += `+\`${t}\``;
            }
        });
        return new Function('data', "return " + renderFunction);
    }
    /**
     * A very simple but fast hash function returning a 32 bit integer
     * @param str
     * @returns
     */
    static hash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash &= hash;
        }
        return hash;
    }
    ;
}
exports.default = Templater;
Templater.hashes = {};
Templater.templateFolder = './';
class CachedTemplate {
    constructor(hash, fn) {
        this.hash = hash;
        this.fn = fn;
    }
}