import React from 'react';
import Button from '@mui/material/Button';

export default function ConfirmDialog({
    showKickConfirm,
    setShowKickConfirm,
    handleKickUser,
    showTransferConfirm,
    setShowTransferConfirm,
    handleTransferHost,
    connectedUsers
}) {
    return (
        <>
            {/* Kick Confirmation Dialog */}
            {showKickConfirm && (
                <div className="confirmDialog" onClick={() => setShowKickConfirm(null)}>
                    <div className="confirmDialogContent" onClick={(e) => e.stopPropagation()}>
                        <h3>Remove Participant?</h3>
                        <p>
                            Are you sure you want to remove{' '}
                            {connectedUsers.find(u => u.socketId === showKickConfirm)?.name || 'this user'}{' '}
                            from the meeting?
                        </p>
                        <div className="confirmDialogActions">
                            <Button
                                onClick={() => setShowKickConfirm(null)}
                                variant="outlined"
                                sx={{
                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                    color: '#fff',
                                    '&:hover': { borderColor: '#fff' }
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => handleKickUser(showKickConfirm)}
                                variant="contained"
                                sx={{
                                    background: 'linear-gradient(135deg, #ff4757, #c0392b)',
                                    color: '#fff',
                                    '&:hover': { background: 'linear-gradient(135deg, #ff6b6b, #e74c3c)' }
                                }}
                            >
                                Remove
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Transfer Host Confirmation Dialog */}
            {showTransferConfirm && (
                <div className="confirmDialog" onClick={() => setShowTransferConfirm(null)}>
                    <div className="confirmDialogContent" onClick={(e) => e.stopPropagation()}>
                        <h3>Transfer Host Privileges?</h3>
                        <p>
                            Are you sure you want to make{' '}
                            {connectedUsers.find(u => u.socketId === showTransferConfirm)?.name || 'this user'}{' '}
                            the new host? You will lose host privileges.
                        </p>
                        <div className="confirmDialogActions">
                            <Button
                                onClick={() => setShowTransferConfirm(null)}
                                variant="outlined"
                                sx={{
                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                    color: '#fff',
                                    '&:hover': { borderColor: '#fff' }
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => handleTransferHost(showTransferConfirm)}
                                variant="contained"
                                sx={{
                                    background: 'linear-gradient(135deg, #ffd700, #ffb700)',
                                    color: '#000',
                                    fontWeight: 600,
                                    '&:hover': { background: 'linear-gradient(135deg, #ffe44d, #ffd700)' }
                                }}
                            >
                                Transfer
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
