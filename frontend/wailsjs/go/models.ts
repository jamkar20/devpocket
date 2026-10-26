export namespace main {
	
	export class DesktopInfo {
	    name: string;
	    version: string;
	
	    static createFrom(source: any = {}) {
	        return new DesktopInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.version = source["version"];
	    }
	}

}

