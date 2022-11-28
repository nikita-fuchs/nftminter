export const aex141nftContract = 

`@compiler >= 6

include "List.aes"
include "Option.aes"
include "String.aes"

namespace Utils =
    function bool_to_string(v: bool): string =
        switch (v)
            true => "true"
            false => "false"

contract interface IAEX141 =
    datatype metadata_type = URL | IPFS | OBJECT_ID | MAP
    datatype metadata = MetadataIdentifier(string) | MetadataMap(map(string, string))

    record meta_info = 
        { name: string
        , symbol: string
        , base_url: option(string)
        , metadata_type : metadata_type
        }

    entrypoint aex141_extensions : () => list(string)
    entrypoint meta_info : () => meta_info
    entrypoint metadata : (int) => option(metadata)
    entrypoint balance : (address) => option(int)
    entrypoint owner : (int) => option(address)  
    stateful entrypoint transfer : (address, address, int, option(string)) => unit
    stateful entrypoint approve : (address, int, bool) => unit
    stateful entrypoint approve_all : (address, bool) => unit
    entrypoint get_approved : (int) => option(address)
    entrypoint is_approved : (int, address) => bool
    entrypoint is_approved_for_all : (address, address) => bool

contract interface IAEX141NFTReceiver = 
    entrypoint on_nft_received : (address, address, int, option(string)) => bool

contract MintableMappedMetadataNFT =

    datatype event
        = Transfer(address, address, int)
        | Approval(address, address, int, string)
        | ApprovalForAll(address, address, string)
        // | MutableAttributesUpdated(string, string)

    datatype metadata_type = URL | IPFS | OBJECT_ID | MAP
    datatype metadata = MetadataIdentifier(string) | MetadataMap(map(string, string))

    record meta_info =
        { name: string
        , symbol: string
        , base_url: option(string)
        , metadata_type : metadata_type}
    
    record state =
        { owner: address
        , meta_info: meta_info
        , owners: map(int, address)
        , balances: map(address, int)
        , approvals: map(int, address)
        , operators: map(address, map(address, bool))
        , metadata: map(int, metadata)
        , counter: int }

    stateful entrypoint init(name: string, symbol: string) =
        require(String.length(name) >= 1, "STRING_TOO_SHORT_NAME")
        require(String.length(symbol) >= 1, "STRING_TOO_SHORT_SYMBOL")
        { owner = Contract.creator,
          meta_info = { name = name, symbol = symbol, base_url = None, metadata_type = MAP },
          owners = {},
          balances = {},
          approvals = {},
          operators = {},
          metadata = {},
          counter = 1 }
    
    stateful entrypoint mint(owner: address, metadata: option(metadata), data: option(string)) : int =  
        require_contract_owner()
        switch(metadata)
            None => abort("NO_METADATA_PROVIDED")
            Some(MetadataIdentifier(_)) => abort("NOT_METADATA_MAP")
            Some(v) =>
                let token_id = state.counter
                let timestamped_metadata =
                    switch(v)
                        MetadataMap(v) => MetadataMap(v{["minted"]=Int.to_str(Chain.timestamp)})

                put(state{counter = state.counter + 1, balances[owner = 0] @ b = b + 1, owners[token_id] = owner, metadata[token_id] = v})
                let from = ak_11111111111111111111111111111111273Yts
                switch(invoke_nft_receiver(from, owner, token_id, data))
                    (true, false) => abort("SAFE_TRANSFER_FAILED")
                    _ => Chain.event(Transfer(from, owner, token_id))
                token_id

    entrypoint aex141_extensions() : list(string) =
        ["mintable", "mapped_metadata"]

    entrypoint meta_info() : meta_info =
        state.meta_info

    entrypoint metadata(token_id: int) : option(metadata) =
        Map.lookup(token_id, state.metadata)

    entrypoint balance(owner: address) : option(int) =
        Map.lookup(owner, state.balances)

    entrypoint owner(token_id: int) : option(address) =
        Map.lookup(token_id, state.owners)

    stateful entrypoint transfer(from: address, to: address, token_id: int, data: option(string)) =
        require(from != to, "SENDER_MUST_NOT_BE_RECEIVER")
        require_authorized(token_id)
        require_token_owner(token_id, from)
        remove_approval(token_id)
        put( state { balances[from] @b = b - 1, balances[to = 0] @nb = nb + 1, owners[token_id] = to } )
        switch(invoke_nft_receiver(from, to, token_id, data))
            (true, false) => abort("SAFE_TRANSFER_FAILED")
            _ => Chain.event(Transfer(from, to, token_id))

    stateful entrypoint approve(approved: address, token_id: int, enabled: bool) =
        require_authorized(token_id)
        if(enabled)
            put(state{approvals[token_id] = approved})
        else
            remove_approval(token_id)
        Chain.event(Approval(Call.caller, approved, token_id, Utils.bool_to_string(enabled)))

    stateful entrypoint approve_all(operator: address, enabled: bool) =
        put( state { operators = { [Call.caller] = { [operator] = enabled }} } )
        Chain.event(ApprovalForAll(Call.caller, operator, Utils.bool_to_string(enabled)))

    entrypoint get_approved(token_id: int) : option(address) =
        Map.lookup(token_id, state.approvals)

    entrypoint is_approved(token_id: int, a: address) : bool =
        switch(Map.lookup(token_id, state.approvals))
            None => false
            Some(o) => o == a

    entrypoint is_approved_for_all(owner: address, operator: address) : bool =
        switch(Map.lookup(owner, state.operators))
            None => false
            Some(ops) =>
                switch(Map.lookup(operator, ops))
                    None => false
                    Some(v) => v

    stateful entrypoint update_mutable_attributes(token_id: int, mutable_attributes: string) =
        require_contract_owner()
        switch(Map.lookup(token_id, state.metadata))
            None =>
                abort("METADATA_DOES_NOT_EXIST") // this case should never happen
            Some(v) =>
                // let old_metadata_map = state.metadata[token_id]
                let updated_metadata_map =
                    switch(v)
                        MetadataIdentifier(v) => abort("ERROR_CORRUPT_METADATA")
                        MetadataMap(v) => MetadataMap(v{["mutable_attributes"]=mutable_attributes})
                put(state{metadata = state.metadata{[token_id]=updated_metadata_map}})
                // Chain.event(MutableAttributesUpdated(old_metadata_map["mutable_attributes"], updated_metadata_map["mutable_attributes"]))

    function is_token_owner(token_id: int, a: address) : bool =
        switch(Map.lookup(token_id, state.owners))
            None => false
            Some(o) => o == a

    function require_contract_owner() : unit =
        require(Call.caller == state.owner, "ONLY_CONTRACT_OWNER_CALL_ALLOWED")

    function require_authorized(token_id: int) : unit =
        let owner = switch(owner(token_id))
            None => abort("INVALID_TOKEN_ID")
            Some(v) => v
        require(Call.caller == owner || is_approved(token_id, Call.caller) || is_approved_for_all(owner, Call.caller), "ONLY_OWNER_APPROVED_OR_OPERATOR_CALL_ALLOWED")

    function require_token_owner(token_id: int, a: address) : unit =
        require(is_token_owner(token_id, a), "ONLY_OWNER_CALL_ALLOWED")

    stateful function remove_approval(token_id: int) : unit =
        if(Map.member(token_id, state.approvals))
            put( state { approvals = Map.delete(token_id, state.approvals)})

    function invoke_nft_receiver(from: address, to: address, token_id: int, data: option(string)) : (bool * bool) =
        if(Address.is_contract(to))
            let c = Address.to_contract(to)
            switch(c.on_nft_received(from, to, token_id, data, protected = true) : option(bool))
                None => (true, false)
                Some(val) => (true, val)
        else
            (false, false)`