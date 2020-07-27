import React from 'react';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';

export default function RadioButtons(props) {
    return (
        <FormControl component="fieldset" style={{marginRight: 20, marginBottom: 20, marginLeft: 2}}>
            <RadioGroup aria-label="position" name="position" value={props.value} onChange={props.onChange} row>
                <FormControlLabel
                    value={'Create'}
                    control={ <Radio color="primary" /> }
                    label='Create a new Stellar Wallet'
                    labelPlacement="end"
                />
                <FormControlLabel
                    value={"Add"}
                    control={ <Radio color="primary" /> }
                    label='Add an existing Stellar Wallet'
                    labelPlacement="end"
                />
            </RadioGroup>
        </FormControl>
    );
}
