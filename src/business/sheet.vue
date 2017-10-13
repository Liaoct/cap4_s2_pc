<script>
    import Api from '../common/api';
    import FormData from '../../static/from';
    import {
        Form as ElForm,
        Input as ElInput,
        Button as ElButton,
        CheckBox as ElCheckBox,
        Radio as ElRadio,
        Calenda as ElCalendar
    } from 'cap-ui';

    const params = {
        rightId : '4934368602173165503',
        moduleId : '-2652479162664269835',
        moduleType : '42'
    };
    const fetch = {
        url : 'http://10.5.5.231:8080/seeyon/rest/cap4/form/createOrEdit',
        method : 'POST',
        body : params
    };

    const fieldMap = {
        text(node) {
            if (node.ctrlType === 'suiNumber') return fieldMap.number.apply(this, node);
            return (<div>text</div>);
        },
        number() {
            return (<div>number</div>);
        },
        table(data) {
            return this.renderTable(data);
        }
    };

    export default {
        data() {
            return {
                test : 'test',
                data : FormData.data.data
            };
        },
        props : {},
        mounted() {
//            this.requestFormData();
            console.log(FormData);
        },
        methods : {
            async requestFormData() {
                const { data } = await Api.resource(fetch);
//                this.data = data;
                console.log(data);
            },
            renderTable(table) {
                const row = table.row;
                const col = table.col;
                table.mergeMap = this.getMergeMap(row, col, table);
                console.log('current table map : ', table.mergeMap);
                return (
                    <table border="1">
                        {
                            Array(row).fill(null).map((r, rIndex) => this.renderTableTr(rIndex, col, table))
                        }
                    </table>
                );
            },
            getMergeMap(row, col, table) {
                const mergeMap = [];
                let rowIndex = 0;
                while (rowIndex < row) {
                    mergeMap[rowIndex] = Array(col).fill(0);
                    rowIndex++;
                }
                const merges = table.merges;
                merges.forEach(m => {
                    const r = m.startRowIndex;
                    const c = m.startColIndex;
                    const rowSpan = m.rowSpan;
                    const colSpan = m.colSpan;
                    for (let rStep = 0; rStep < rowSpan; rStep++) {
                        for (let cStep = 0; cStep < colSpan; cStep++) {
                            const cellRowIndex = r + rStep;
                            const cellColIndex = c + cStep;
                            mergeMap[cellRowIndex][cellColIndex] = 1;
                        }
                    }
                });
                return mergeMap;
            },
            renderTableTr(rIndex, col, table) {
                return (
                    <tr>
                        {
                            Array(col).fill(null).map((c, cIndex) => this.renderTableTd(rIndex, cIndex, table))
                        }
                    </tr>
                );
            },
            renderTableTd(rIndex, cIndex, table) {
                const cell = this.getCell(rIndex, cIndex, table);
                const isMerged = this.isMergedCell(rIndex, cIndex, table.mergeMap);
                const isMergeOriginCell = this.isMergeOriginCell(rIndex, cIndex, table);
                if (isMerged && !isMergeOriginCell) return null;
                const style = this.getCellStyle(cIndex, table);
                console.log(style);
                if (cell && isMergeOriginCell) {
                    return (
                        <td colspan={ isMergeOriginCell.colSpan } rowspan={ isMergeOriginCell.rowSpan } style={ style }>
                            { this.getCellFields(cell) }
                        </td>
                    );
                }
                if (cell && !isMerged) return (<td style={ style }>{ this.getCellFields(cell) }</td>);
                return (<td style={ style }></td>);
            },
            getCell(rIndex, cIndex, table) {
                const cells = table.cells;
                return cells.find(cell => cell.rowIndex === rIndex && cell.colIndex === cIndex);
            },
            isMergedCell(rIndex, cIndex, map) {
                return map[rIndex][cIndex];
            },
            isMergeOriginCell(rIndex, cIndex, table) {
                const merges = table.merges;
                return merges.find(m => m.startRowIndex === rIndex && m.startColIndex === cIndex);
            },
            getCellFields(cell) {
                const children = cell.children;
                if (!children) return null;
                return children.map(node => this.parseNode(node));
            },
            getCellStyle(colIndex, table) {
                const colWidths = table.colWidths;
                const width = colWidths[colIndex];
                return {
                    width : `${parseInt(width, 10)}px`
                };
            },
            parseNode(node) {
                const nodeType = node.nodeType === 'ctrl' ? node.type : node.nodeType;
                return fieldMap.hasOwnProperty(nodeType) ? fieldMap[nodeType].call(this, node) : null;
            }
        },
        render() {
            if (!this.data) return null;
            const view = this.data.viewInfo.viewContent.children;
            return (
                <div>
                    {
                        view.map(node => this.parseNode(node))
                    }
                </div>
            );
        },
        components : {
            ElForm,
            ElInput,
            ElButton,
            ElCheckBox,
            ElRadio,
            ElCalendar
        }
    };
</script>

<style>

</style>
