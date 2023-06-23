import React, {Component} from 'react';
import {Table, TableData} from '@finos/perspective';
import {ServerRespond} from './DataStreamer';
import {DataManipulator} from './DataManipulator';
import './Graph.css';

interface IProps {
    data: ServerRespond[],
}

// Define a new `PerspectiveViewerElement` interface.
interface PerspectiveViewerElement extends HTMLElement {
    load: (table: Table) => void,
}

// Define a new `PerspectiveViewer` class.
class Graph extends Component<IProps, {}> {
    table: Table | undefined;

    // Render the `<perspective-viewer>` DOM reference.
    render() {
        return React.createElement('perspective-viewer');
    }

    componentDidMount() {
        // Get element from the DOM.
        const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

        // Define the schema for the `table`.
        const schema = {
            price_abc: 'float',
            price_def: 'float',
            ratio: 'float',
            timestamp: 'date',
            upper_bound: 'float',
            lower_bound: 'float',
            trigger_alert: 'float'
        };

        // Create the `table` from the `schema`.
        if (window.perspective && window.perspective.worker()) {
            this.table = window.perspective.worker().table(schema);
        }

        if (this.table) {
            // Load the `table` in the `<perspective-viewer>` DOM reference.
            elem.load(this.table);
            elem.setAttribute('view', 'y_line');
            elem.setAttribute('row-pivots', '["timestamp"]');
            elem.setAttribute('columns', '["ratio", "lower_bound", "upper_bound", "trigger_alert"]');
            elem.setAttribute('aggregates', JSON.stringify({
                price_abc: 'avg',
                price_def: 'avg',
                ratio: 'avg',
                timestamp: 'distinct count',
                upper_bound: 'avg',
                lower_bound: 'avg',
                trigger_alert: 'avg'
            }));
        }
    }

    // Update the `table` with the new `data`.
    componentDidUpdate() {
        if (this.table) { // Check if `this.table` is defined.
            this.table.update([  // Update the `table` with new data.
                DataManipulator.generateRow(this.props.data),  // Generate a new row.
            ] as unknown as TableData);  // Cast `TableData`.
        }
    }
}

export default Graph;