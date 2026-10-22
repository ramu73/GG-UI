import traceback
from fastapi import APIRouter, HTTPException, status
from typing import List
from app.models.schemas import (
    PartnerCreate,
    PartnerUpdate,
    PartnerResponse,
    PartnerTransactionCreate,
    PartnerTransactionResponse
)
from app.services import ledger_db

router = APIRouter(prefix="/api/partners", tags=["Partner Ledger & Splitwise"])

# ==================== 1. TRANSACTIONS ENDPOINTS (Placed first to avoid route collision with /{partner_id}) ====================

@router.get("/transactions", response_model=List[PartnerTransactionResponse])
async def list_transactions():
    """
    Retrieves all partner investments, shared expenses, and settlements from the database.
    """
    try:
        txs = ledger_db.get_all_transactions()
        return txs
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error while fetching transactions: {str(e)}"
        )

@router.post("/transactions", response_model=PartnerTransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(tx: PartnerTransactionCreate):
    """
    Inserts a new investment, shared expense, or debt settlement record into the database.
    """
    try:
        created = ledger_db.add_transaction(tx.dict())
        return created
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error while creating transaction: {str(e)}"
        )

@router.delete("/transactions")
async def clear_all_transactions():
    """
    Wipes all transactions from the database (clean blank slate).
    """
    try:
        count = ledger_db.clear_all_transactions()
        return {"status": "success", "message": f"All {count} transactions cleared from database."}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error while clearing transactions: {str(e)}"
        )

@router.delete("/transactions/{transaction_id}")
async def delete_transaction(transaction_id: str):
    """
    Deletes a transaction from the database.
    """
    try:
        deleted = ledger_db.delete_transaction(transaction_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Transaction with ID '{transaction_id}' was not found in database."
            )
        return {"status": "success", "message": f"Transaction {transaction_id} deleted."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error while deleting transaction: {str(e)}"
        )

# ==================== 2. PARTNERS ENDPOINTS ====================

@router.get("", response_model=List[PartnerResponse])
async def list_partners():
    """
    Retrieves all partners from the database.
    """
    try:
        partners = ledger_db.get_all_partners()
        return partners
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error while fetching partners: {str(e)}"
        )

@router.post("", response_model=PartnerResponse, status_code=status.HTTP_201_CREATED)
async def create_partner(partner: PartnerCreate):
    """
    Adds a new partner to the database.
    """
    try:
        created = ledger_db.add_partner(partner.dict())
        return created
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error while adding partner: {str(e)}"
        )

@router.put("/{partner_id}", response_model=PartnerResponse)
async def update_partner(partner_id: str, partner: PartnerUpdate):
    """
    Updates partner details (name, email, phone, color, initial equity).
    """
    if partner_id == "transactions":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid partner ID")
    try:
        updated = ledger_db.update_partner(partner_id, partner.dict(exclude_unset=True))
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Partner with ID '{partner_id}' was not found in the database."
            )
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error while updating partner: {str(e)}"
        )

@router.delete("/{partner_id}")
async def delete_partner(partner_id: str):
    """
    Deletes a partner from the database.
    """
    if partner_id == "transactions":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid partner ID")
    try:
        deleted = ledger_db.delete_partner(partner_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Partner with ID '{partner_id}' not found in database."
            )
        return {"status": "success", "message": f"Partner {partner_id} deleted."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error while deleting partner: {str(e)}"
        )
