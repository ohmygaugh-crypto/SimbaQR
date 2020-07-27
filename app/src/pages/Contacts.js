import React, {useState, useEffect} from 'react';
import { useAuth0 } from "../react-auth0-wrapper";
import { Grid, Typography, makeStyles, Button, Box } from "@material-ui/core";
import Card from "@material-ui/core/Card";
import axios from 'axios';
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import CircularIndeterminate from "../components/CircularIndeterminate";
import Fab from "@material-ui/core/Fab";
import AddIcon from '@material-ui/icons/Add';
import EditContactDialog from "../components/editContactDialog";
import CreateContactDialog from "../components/createContactDialog";
import SendMoneyDialog from "../components/sendMoneyDialog";
import useForm from "../hooks/useForm";
import { fields, validate } from "../hooks/validateContact";

const useStyles = makeStyles((theme) => ({
    grid: {
        padding: theme.spacing(3),
        overflowX: 'hidden',
    },
    card: {
        position: 'relative'
    },
    button: {
        marginRight: 6
    },
    buttonBox: {
        marginLeft: theme.spacing(0.5),
        position: 'absolute',
        right: '5%',
        top: '35%'
    },
    progress: {
        position: 'absolute',
        left: '49.2%',
        top: '44.7%',
    },
    fab: {
        position: 'fixed',
        bottom: theme.spacing(4),
        right: theme.spacing(4),
    },
}));

const Contacts = props => {
    const classes = useStyles();
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState({
        createContact: false,
        editContact: false,
        sendMoney: false
    });
    const [send, setSend] = useState('');
    const { getTokenSilently } = useAuth0();
    const { handleChange, handleSubmit, values, errors, setValues } = useForm(onSubmit, validate, fields);

    async function onSubmit() {
        try {
            const token = await getTokenSilently();
            const result = await axios.post('/editContact', values, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            for (let i = 0; i < contacts.length; i++) {
                if (contacts[i].id === values.id) {
                    contacts[i] = result.data;
                    break;
                }
            }
            setModal(oldValues => ({
                ...oldValues,
                'editContact': !modal['editContact']
            }));
        } catch (error) {
            console.log(error);
        }
    }
    
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = await getTokenSilently();
                const result = await axios.post('/getContacts', {},{
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log(result);
                setContacts(result.data);
                setLoading(false);
            } catch (error) {
                console.log(error);
            }
        };
        fetchData();
    }, []);
    
    if (loading) {
        return (
            <div className={classes.progress}>
                <CircularIndeterminate/>
            </div>
        );
    }
    
    const handleModal = (open, contactID, contactName, contactExtra, contactPublic) => (event) => {
        if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        // eslint-disable-next-line default-case
        switch(open) {
            case 'editContact':
                if (modal.editContact) {
                    break
                } else {
                    setValues(oldValues => ({
                        ...oldValues, 'id': contactID, 'name': contactName, 'extraInfo': contactExtra, 'publicKey': contactPublic
                    }));
                    break;
                }
            case 'createContact':
                break;
            case 'sendMoney':
                setSend(contactPublic);
        }
        setModal(oldValues => ({
            ...oldValues,
            [open]: !modal[open]
        }));
    };
    
    const createContacts = (contact) => {
        return (
            <Grid item xs={12} key={contact.id}>
                <Card className={classes.card}>
                    <CardContent>
                        <Typography variant="h5" color="textPrimary" component="p">
                            {contact.name}
                        </Typography>
                        <Typography variant="subtitle2" color="textSecondary" component="p">
                            {contact.extraInfo}
                        </Typography>
                        <Typography className={classes.balances} variant={"subtitle2"} color={"textPrimary"} component="p">
                            {contact.publicKey}
                        </Typography>
                        <Box className={classes.buttonBox}>
                            <Button onClick={handleModal('sendMoney', contact.id, contact.name, contact.extraInfo, contact.publicKey)} size={"medium"} variant="contained" color={"primary"}>Send Money</Button>
                        </Box>
                    </CardContent>
                    <CardActions>
                        <Button onClick={handleModal('editContact', contact.id, contact.name, contact.extraInfo, contact.publicKey)} size={"small"} variant="contained" color={"secondary"}>Edit Contact</Button>
                    </CardActions>
                </Card>
            </Grid>
        );
    };
    
    return (
        <div className={classes.grid}>
            <Grid container spacing={3}>
                {contacts.map(contact => {
                    return createContacts(contact);
                })}
            </Grid>
            <Fab onClick={handleModal('createContact')} color="secondary" aria-label="add" className={classes.fab}>
                <AddIcon />
            </Fab>
            <EditContactDialog
                open={modal.editContact}
                name={values.name}
                extraInfo={values.extraInfo}
                publicKey={values.publicKey}
                onClick={handleSubmit}
                onChange={handleChange}
                onClose={handleModal('editContact')}
                cancel={handleModal('editContact')}
                error={errors.publicKey}
            />
            <CreateContactDialog
                open={modal.createContact}
                onClick={handleSubmit}
                onChange={handleChange}
                onClose={handleModal('createContact')}
                contacts={contacts}
            />
            <SendMoneyDialog
                open={modal.sendMoney}
                onClose={handleModal('sendMoney')}
                cancel={handleModal('sendMoney')}
                destination={send}
                walletSeed={props.walletSeed}
                walletPublicKey={props.walletPublicKey}
            />
        </div>
    )
};

export default Contacts;