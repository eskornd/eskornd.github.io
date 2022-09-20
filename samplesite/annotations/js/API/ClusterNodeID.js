/** 
 * @class
 * @hideconstructor
 * @classdesc Cluster NodeID of a document
 */
export class ClusterNodeID
{
	constructor ()
	{
		/**
		 * Cluster ID, mandatory
		 * @type {string}
		 */ 
		this.cluster = '';

		/**
		 * NodeID mandatory
		 * @type {string}
		 */ 
		this.nodeID = '';

	}
}

